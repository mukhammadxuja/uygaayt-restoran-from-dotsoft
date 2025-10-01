import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAppContext } from '@/context/AppContext';
import { auth, db, storage } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

function General({ photo, isFormChanged, setIsFormChanged, setImageSelected }) {
  const { userData, setUserData } = useAppContext();
  const { t } = useTranslation();

  const defaultValues = {
    displayName: userData?.displayName || '',
    location: userData?.location || '',
  };

  const {
    control,
    handleSubmit,
    register,
    setError,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm({ defaultValues });

  useEffect(() => {
    reset({
      displayName: userData?.displayName || '',
      location: userData?.location || '',
    });
  }, [userData, reset]);

  const onSubmit = async (data) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No user is logged in.');
      }

      let photoURL = userData?.photoURL || null;

      if (photo.startsWith('data:')) {
        if (!photo.startsWith('data:')) {
          throw new Error('Invalid photo format. Please select a valid image.');
        }

        const storageRef = ref(storage, `user_photos/${currentUser.uid}`);
        await uploadString(storageRef, photo, 'data_url');
        photoURL = await getDownloadURL(storageRef);
      }

      const updatedData = {
        displayName: data.displayName,
        location: data.location,
        photoURL,
      };

      await setDoc(doc(db, 'users', currentUser.uid), updatedData, {
        merge: true,
      });

      setUserData((prevUserData) => ({
        ...prevUserData,
        ...updatedData,
      }));

      setImageSelected(null);
      toast('Profile updated successfully');
      setIsFormChanged(false);
    } catch (err) {
      console.error('Error updating profile:', err.message);
      setError('submit', {
        message: 'Failed to update profile. Please try again.',
      });
    }
  };

  const handleCancel = () => {
    reset(defaultValues);
    setIsFormChanged(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col items-start space-y-2">
        <Label required>{t('displayName')}</Label>
        <Input
          disabled={isSubmitting}
          {...register('displayName', { required: 'Display Name is required' })}
          placeholder={t('johnDoe')}
          onChange={() => setIsFormChanged(true)}
        />
        {errors.displayName && <p>{errors.displayName.message}</p>}
      </div>

      <div className="flex flex-col items-start space-y-2">
        <Label optional>{t('location')}</Label>
        <Input
          disabled={isSubmitting}
          {...register('location')}
          placeholder={t('sanFrancisco')}
          onChange={() => setIsFormChanged(true)}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            {t('cancel')}
          </Button>
          <Button disabled={isSubmitting || !isFormChanged} type="submit">
            {isSubmitting ? `${t('saving')}` : `${t('save')}`}
          </Button>
        </div>
      </div>
    </form>
  );
}

export default General;
