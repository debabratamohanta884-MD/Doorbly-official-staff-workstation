import React, { useState } from 'react';
import { DOORBLY_OFFICIAL_LOGO_URL } from '../../constants/branding';

interface DoorblyLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  textVariant?: 'dark' | 'light';
  subtitle?: string;
  badgeText?: string;
  rounded?: boolean;
  animateFlip?: boolean;
  showOrbitLight?: boolean;
  hideSubtitleOnMobile?: boolean;
}

export const DoorblyLogo: React.FC<DoorblyLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
  textVariant = 'dark',
  subtitle,
  badgeText,
  rounded = true,
  animateFlip = false,
  showOrbitLight = false,
  hideSubtitleOnMobile = false
}) => {
  const [imgError, setImgError] = useState(false);

  // Dimension presets with tailored orbit ring, compact badge typography, and sharp pinpoint green laser light
  const sizeMap = {
    xs: {
      img: 'w-6 h-6',
      text: 'text-sm',
      badge: 'text-[7px] px-1 py-[1px]',
      orbitInset: '-inset-1',
      pinpointSize: 'w-[3.5px] h-[3.5px]'
    },
    sm: {
      img: 'w-8 h-8',
      text: 'text-lg',
      badge: 'text-[8px] px-1.5 py-[1px]',
      orbitInset: '-inset-1',
      pinpointSize: 'w-[4px] h-[4px]'
    },
    md: {
      img: 'w-10 h-10',
      text: 'text-xl',
      badge: 'text-[8px] sm:text-[9px] px-1.5 py-[1px]',
      orbitInset: '-inset-1.5',
      pinpointSize: 'w-[5px] h-[5px]'
    },
    lg: {
      img: 'w-14 h-14',
      text: 'text-2xl',
      badge: 'text-[9px] px-1.5 py-0.5',
      orbitInset: '-inset-2',
      pinpointSize: 'w-[6px] h-[6px]'
    },
    xl: {
      img: 'w-20 h-20',
      text: 'text-3xl',
      badge: 'text-[10px] px-2 py-0.5',
      orbitInset: '-inset-2.5',
      pinpointSize: 'w-[7px] h-[7px]'
    }
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center space-x-3 select-none ${className}`}>
      {/* Official Emblem Container */}
      <div className={`relative shrink-0 flex items-center justify-center ${currentSize.img}`}>
        {/* Continuous Orbiting Sharp Pinpoint Green Laser Light */}
        {showOrbitLight && (
          <div
            className={`absolute ${currentSize.orbitInset} rounded-full border border-emerald-500/20 pointer-events-none animate-doorbly-orbit z-10`}
            aria-hidden="true"
          >
            {/* Razor-sharp pinpoint green light dot positioned at perimeter */}
            <div
              className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 ${currentSize.pinpointSize} doorbly-pinpoint-dot`}
            />
          </div>
        )}

        {/* Official Emblem (Continuous 3D Flip when enabled on header) */}
        <div
          className={`w-full h-full flex items-center justify-center overflow-hidden transition-transform duration-200 ${
            rounded ? 'rounded-xl' : ''
          } ${animateFlip ? 'animate-doorbly-flip' : ''}`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {!imgError ? (
            <img
              src={DOORBLY_OFFICIAL_LOGO_URL}
              alt="Doorbly Official Logo"
              className="w-full h-full object-contain filter drop-shadow-xs"
              onError={() => setImgError(true)}
              loading="eager"
            />
          ) : (
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#0F766E] to-[#123C45] text-white flex items-center justify-center font-black tracking-tight shadow-xs">
              D
            </div>
          )}
        </div>
      </div>

      {/* Optional Brand Typography */}
      {showText && (
        <div className="flex flex-col leading-none min-w-0">
          <span
            className={`font-black tracking-tight ${currentSize.text} lowercase inline-flex items-center leading-none`}
          >
            <span className={textVariant === 'light' ? 'text-white' : 'text-gray-900'}>door</span>
            <span className="text-[#FACC15]">bly</span>
          </span>
          {badgeText && (
            <div className="mt-1">
              <span
                className={`inline-block font-bold uppercase tracking-wider rounded leading-none ${currentSize.badge} ${
                  textVariant === 'light'
                    ? 'bg-green-400/15 text-[#86EFAC] border border-green-400/35'
                    : 'bg-green-100 text-green-700 border border-green-300'
                }`}
              >
                {badgeText}
              </span>
            </div>
          )}
          {subtitle && (
            <p
              className={`text-[10px] leading-tight mt-0.5 truncate ${
                hideSubtitleOnMobile ? 'hidden sm:block' : ''
              } ${
                textVariant === 'light' ? 'text-teal-200/90' : 'text-gray-500'
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
