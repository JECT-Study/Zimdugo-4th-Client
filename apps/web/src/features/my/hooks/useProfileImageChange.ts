import { m } from "@repo/i18n";
import { type ChangeEvent, useCallback, useRef, useState } from "react";
import { MAX_REPORT_PHOTO_SIZE_BYTES } from "#/features/report/model/useReportForm";
import { readImageFileAsDataUrl } from "#/features/my/lib/read-image-file-as-data-url";
import { useUpdateMeProfile } from "#/features/my/hooks/useUpdateMeProfile";

export function useProfileImageChange() {
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);
  const [isErrorPopupOpen, setIsErrorPopupOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: updateProfile, isPending: isUpdatingProfileImage } =
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

      if (!file) {
        return;
      }

      if (!file.type.startsWith("image/")) {
        setErrorMessage(m.my_profile_image_invalid());
        setIsErrorPopupOpen(true);
        return;
      }

      if (file.size > MAX_REPORT_PHOTO_SIZE_BYTES) {
        setErrorMessage(m.report_photo_max_size_exceeded());
        setIsErrorPopupOpen(true);
        return;
      }

      try {
        const profileImageUrl = await readImageFileAsDataUrl(file);
        updateProfile(
          { profileImageUrl },
          {
            onError: () => {
              setErrorMessage(m.my_profile_image_update_failed());
              setIsErrorPopupOpen(true);
            },
          },
        );
      } catch {
        setErrorMessage(m.my_profile_image_read_failed());
        setIsErrorPopupOpen(true);
      }
    },
    [updateProfile],
  );

  return {
    isConfirmPopupOpen,
    setIsConfirmPopupOpen,
    isErrorPopupOpen,
    setIsErrorPopupOpen,
    errorMessage,
    fileInputRef,
    isUpdatingProfileImage,
    openConfirmPopup,
    handleConfirmChange,
    handleFileChange,
  };
}
