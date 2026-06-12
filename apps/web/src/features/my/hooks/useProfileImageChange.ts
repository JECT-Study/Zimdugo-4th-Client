import { m } from "@repo/i18n";
import { type ChangeEvent, useCallback, useRef, useState } from "react";
import { useUpdateMeProfile } from "#/features/my/hooks/useUpdateMeProfile";
import {
  ProfilePhotoUploadValidationError,
  uploadProfilePhoto,
} from "#/features/my/lib/upload-profile-photo";
import type { ProfilePhotoValidationError } from "#/features/my/lib/validate-profile-photo-file";
import { useAuthStore } from "#/shared/store/authStore";

const getProfilePhotoValidationMessage = (
  error: ProfilePhotoValidationError,
): string =>
  error === "invalid_type"
    ? m.my_profile_image_invalid()
    : m.report_photo_max_size_exceeded();

export function useProfileImageChange() {
  const userId = useAuthStore((state) => state.userId);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);
  const [isErrorPopupOpen, setIsErrorPopupOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: updateProfile, isPending: isUpdatingProfileImage } =
    useUpdateMeProfile();

  const openConfirmPopup = useCallback(() => {
    setIsConfirmPopupOpen(true);
  }, []);

  const handleConfirmChange = useCallback(() => {
    setIsConfirmPopupOpen(false);
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      event.target.value = "";

      if (!file || userId == null) {
        return;
      }

      setIsUploadingProfileImage(true);
      try {
        const profileImageUrl = await uploadProfilePhoto(file);

        await updateProfile({ profileImageUrl });
      } catch (error) {
        if (error instanceof ProfilePhotoUploadValidationError) {
          setErrorMessage(getProfilePhotoValidationMessage(error.code));
        } else {
          setErrorMessage(m.my_profile_image_update_failed());
        }

        setIsErrorPopupOpen(true);
      } finally {
        setIsUploadingProfileImage(false);
      }
    },
    [updateProfile, userId],
  );

  return {
    isConfirmPopupOpen,
    setIsConfirmPopupOpen,
    isErrorPopupOpen,
    setIsErrorPopupOpen,
    errorMessage,
    fileInputRef,
    isUpdatingProfileImage: isUploadingProfileImage || isUpdatingProfileImage,
    openConfirmPopup,
    handleConfirmChange,
    handleFileChange,
  };
}
