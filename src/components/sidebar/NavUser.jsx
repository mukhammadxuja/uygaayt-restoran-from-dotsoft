import { ChevronsUpDown, LogOut, Settings } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAppContext } from '@/context/AppContext';
import { auth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

export function NavUser() {
  const { isMobile, state } = useSidebar();
  const { userData, user } = useAppContext();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={
                state === 'collapsed'
                  ? userData?.displayName || 'User'
                  : undefined
              }
              className={`bg-transparent border border-border hover:bg-muted/90 data-[state=open]:bg-muted data-[state=open]:text-sidebar-accent-foreground rounded-lg group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:!w-10 group-data-[collapsible=icon]:!h-10 group-data-[collapsible=icon]:!mx-auto ${
                state === 'collapsed' ? 'justify-center' : ''
              }`}
            >
              <Avatar
                className={`rounded-lg group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 ${
                  state === 'collapsed' ? 'h-8 w-8' : 'h-8 w-8'
                }`}
              >
                <AvatarImage
                  src={
                    userData?.photoURL
                      ? userData?.photoURL
                      : 'https://firebasestorage.googleapis.com/v0/b/wedding-invitation-58993.appspot.com/o/user_photos%2Funknown.jpg?alt=media&token=e95bc7b0-01b1-4254-b321-e4ee39d1eb55'
                  }
                  alt={
                    userData?.displayName ? userData?.displayName : 'Anonymous'
                  }
                />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div
                className={`grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden ${
                  state === 'collapsed' ? 'hidden' : ''
                }`}
              >
                <span className="truncate font-semibold">
                  {userData?.displayName ? userData?.displayName : 'Anonymous'}
                </span>
                <span className="truncate text-xs">
                  {user?.isAnonymous ? 'anonymous@gmail.com' : user?.email}
                </span>
              </div>
              <ChevronsUpDown
                className={`ml-auto w-5 h-5 group-data-[collapsible=icon]:hidden ${
                  state === 'collapsed' ? 'hidden' : ''
                }`}
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={
                      userData?.photoURL
                        ? userData?.photoURL
                        : 'https://firebasestorage.googleapis.com/v0/b/wedding-invitation-58993.appspot.com/o/user_photos%2Funknown.jpg?alt=media&token=e95bc7b0-01b1-4254-b321-e4ee39d1eb55'
                    }
                    alt={
                      userData?.displayName
                        ? userData?.displayName
                        : 'Anonymous'
                    }
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {' '}
                    {userData?.displayName
                      ? userData?.displayName
                      : 'Anonymous'}
                  </span>
                  <span className="truncate text-xs">
                    {' '}
                    {user?.isAnonymous ? 'anonymous@gmail.com' : user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link to="/dashboard/settings">
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                {t('settings')}
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              {t('logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
