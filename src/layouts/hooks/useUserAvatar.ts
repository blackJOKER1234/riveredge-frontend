import { useEffect, useState } from 'react';
import { getAvatarUrl, getCachedAvatarUrl, isTextAvatarDisplay } from '../../utils/avatar';
import { getUserInfo } from '../../utils/auth';

export function useUserAvatar(currentUser: any, t: (key: string, options?: any) => any) {
  // 头像 URL：优先从缓存读取以消除首屏闪烁，再异步拉取最新
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [avatarImageFailed, setAvatarImageFailed] = useState(false);

  // 获取用户头像 URL（如果有 UUID）
  useEffect(() => {
    const loadAvatarUrl = async () => {
      const userInfo = getUserInfo();
      const avatarUuid = (currentUser as any)?.avatar || userInfo?.avatar;

      if (avatarUuid) {
        const cached = getCachedAvatarUrl(avatarUuid);
        if (cached) setAvatarUrl(cached);

        try {
          const url = await getAvatarUrl(avatarUuid);
          if (url) {
            setAvatarUrl(url);
          } else {
            setAvatarUrl(undefined);
          }
        } catch (error) {
          console.error(t('ui.error.loadAvatar'), error);
          setAvatarUrl(undefined);
        }
      } else {
        let foundAvatar = false;
        if (currentUser) {
          try {
            const { getUserProfile } = await import('../../services/userProfile');
            const profile = await getUserProfile();
            if (profile.avatar) {
              const cached = getCachedAvatarUrl(profile.avatar);
              if (cached) setAvatarUrl(cached);
              const url = await getAvatarUrl(profile.avatar);
              if (url) {
                setAvatarUrl(url);
                foundAvatar = true;
              }
            }
          } catch (error) {
            // 静默失败
          }
        }

        if (!foundAvatar) setAvatarUrl(undefined);
      }
    };

    if (currentUser) {
      loadAvatarUrl();
    }
  }, [currentUser, t]);

  useEffect(() => {
    setAvatarImageFailed(false);
  }, [avatarUrl]);

  const headerTextAvatar = isTextAvatarDisplay(avatarUrl, avatarImageFailed);

  return {
    avatarUrl,
    avatarImageFailed,
    setAvatarImageFailed,
    headerTextAvatar,
  };
}
