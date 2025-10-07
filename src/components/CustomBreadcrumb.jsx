import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';

function CustomBreadcrumb({ clientName, showBackButton = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const pathSegments = location.pathname
    .replace('/dashboard', '')
    .split('/')
    .filter((segment) => segment);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  // Handle special cases for client details
  const getBreadcrumbItems = () => {
    const items = [];

    // Add Dashboard
    items.push({
      label: t('Dashboard'),
      path: '/dashboard',
      isLast: false,
    });

    // Handle client details page
    if (pathSegments[0] === 'clients' && pathSegments[1] && clientName) {
      items.push({
        label: t('Mijozlar'),
        path: '/dashboard/clients',
        isLast: false,
      });
      items.push({
        label: clientName,
        path: location.pathname,
        isLast: true,
      });
    } else {
      // Handle other pages
      pathSegments.forEach((segment, index) => {
        const path = `/dashboard/${pathSegments.slice(0, index + 1).join('/')}`;
        const isLast = index === pathSegments.length - 1;

        // Translate common segments
        let label = capitalize(segment);
        if (segment === 'clients') label = t('Mijozlar');
        else if (segment === 'employees') label = t('Xodimlar');
        else if (segment === 'orders') label = t('Buyurtmalar');
        else if (segment === 'settings') label = t('Sozlamalar');

        items.push({
          label,
          path,
          isLast,
        });
      });
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  const handleBackClick = () => {
    if (pathSegments[0] === 'clients' && pathSegments[1]) {
      navigate('/dashboard/clients');
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {showBackButton && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackClick}
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      )}

      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbItems.map((item, index) => (
            <React.Fragment key={item.path}>
              <BreadcrumbItem className={item.isLast ? '' : 'hidden md:block'}>
                {item.isLast ? (
                  <BreadcrumbPage className="font-medium">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    as={Link}
                    to={item.path}
                    className="hover:text-primary"
                  >
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!item.isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}

export default CustomBreadcrumb;
