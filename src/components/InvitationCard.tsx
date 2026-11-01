import React, { useRef } from 'react';
import { Camera, User as UserIcon } from 'lucide-react';
import { Attendee, EventConfig, DEFAULT_EVENT_CONFIG } from '../types';

interface InvitationCardProps {
  attendee: Attendee;
  config: EventConfig;
  cardId?: string;
  isPrintMode?: boolean;
  onPhotoUpload?: (attendeeId: string, photoUrl: string) => void;
}

export const InvitationCard: React.FC<InvitationCardProps> = ({
  attendee,
  config,
  cardId,
  isPrintMode = false,
  onPhotoUpload,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onPhotoUpload) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onPhotoUpload(attendee.id, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Check if date or venue has been customized from original
  const isCustomFooter =
    config.date !== DEFAULT_EVENT_CONFIG.date ||
    config.venue !== DEFAULT_EVENT_CONFIG.venue;

  return (
    <div
      id={cardId}
      className={`relative w-full aspect-[545/812] overflow-hidden select-none font-bangla ${
        isPrintMode ? 'rounded-[14px]' : 'rounded-[20px] shadow-2xl'
      }`}
      style={{
        backgroundColor: '#e6f3eb',
      }}
    >
      {/* Pristine Blank Template Asset Provided by User */}
      <img
        src="/assets/aistudio/image_2fe8e2c0.png"
        alt="Invitation Card Blank Template"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        crossOrigin="anonymous"
      />

      {/* Lanyard Hole Guide in Print Mode if enabled */}
      {config.showLanyardSlot && isPrintMode && (
        <div
          className="absolute z-30 pointer-events-none"
          style={{
            top: '2.5%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '18%',
            height: '2.8%',
            borderRadius: '9999px',
            border: '1.5px dashed rgba(0, 80, 40, 0.45)',
          }}
          title="ফিতা পরানোর স্লট পাঞ্চ গাইড"
        />
      )}

      {/* Optional Custom Banner Header Overlay (only if user toggles custom banner) */}
      {config.useCustomBanner && (
        <div
          className="absolute z-20 pointer-events-none flex flex-col items-center justify-center text-center px-4"
          style={{
            top: '8.8%',
            left: '4%',
            width: '92%',
            height: '17%',
            background:
              'radial-gradient(ellipse at center, rgba(255,255,255,0.95) 0%, rgba(240,249,244,0.96) 70%, rgba(230,245,236,0.92) 100%)',
            borderRadius: '20px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
            border: '2px solid rgba(13, 99, 61, 0.3)',
          }}
        >
          {/* Arc Top Title */}
          <div className="w-full text-center">
            <span
              className="font-bold tracking-tight text-[#0f3b7d] inline-block"
              style={{
                fontSize: 'clamp(11px, 2.3cqi, 18px)',
                letterSpacing: '0.02em',
                textShadow: '0 1px 2px rgba(255,255,255,0.8)',
              }}
            >
              {config.headerArcTitle}
            </span>
          </div>

          {/* Main Title Styled */}
          <div className="my-0.5">
            <span
              className="font-galada font-bold inline-block text-[#0a5c36]"
              style={{
                fontSize: 'clamp(24px, 5.8cqi, 46px)',
                lineHeight: 1.1,
                filter:
                  'drop-shadow(1px 2px 0px #fff) drop-shadow(2px 3px 0px rgba(13, 99, 61, 0.4))',
              }}
            >
              {config.mainTitle}
            </span>
          </div>

          {/* Slogans */}
          <div className="flex flex-col items-center text-[#9f1239] font-bold leading-tight">
            <span
              style={{
                fontSize: 'clamp(8px, 1.6cqi, 13px)',
              }}
            >
              {config.slogan1}
            </span>
            <span
              style={{
                fontSize: 'clamp(9px, 1.8cqi, 14px)',
              }}
            >
              {config.slogan2}
            </span>
          </div>
        </div>
      )}

      {/* Attendee Profile Photo Area (Circle in Upper Left) */}
      <div
        className="absolute z-20 group"
        style={{
          left: '2.8%',
          top: '20.4%',
          width: '35.0%',
          aspectRatio: '1 / 1',
        }}
      >
        <div className="relative w-full h-full rounded-full overflow-hidden shadow-sm flex items-center justify-center">
          {attendee.photoUrl ? (
            <img
              src={attendee.photoUrl}
              alt={attendee.name}
              className="w-full h-full object-cover"
              crossOrigin="anonymous"
            />
          ) : (
            // Default placeholder avatar if no custom photo uploaded yet
            <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-100/40 text-emerald-800">
              <UserIcon className="w-[48%] h-[48%] text-emerald-700/60" />
            </div>
          )}

          {/* Hover to upload photo in preview mode */}
          {!isPrintMode && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white p-1"
              title="ছবি পরিবর্তন করুন"
            >
              <Camera className="w-5 h-5 mb-1 text-emerald-300" />
              <span className="text-[10px] font-bangla font-semibold text-center leading-tight">
                ছবি পরিবর্তন
              </span>
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      {/* Registration Number (Huge Bengali Digits inside the box) */}
      <div
        className="absolute z-20 flex items-center justify-center"
        style={{
          left: '33.2%',
          top: '34.0%',
          width: '53.4%',
          height: '10.8%',
        }}
      >
        <span
          className="font-anek font-bold text-[#09522e] tracking-wider text-center"
          style={{
            fontSize: 'clamp(28px, 6.2cqi, 52px)',
            lineHeight: 1,
            textShadow: '0 1px 1px rgba(255,255,255,0.7)',
          }}
        >
          {attendee.regNo}
        </span>
      </div>

      {/* 5 Information Fields Text placed precisely into the blank boxes */}
      {/* 1. Name (নামঃ) */}
      <FieldTextRow
        top="46.7%"
        height="6.3%"
        label={config.labelName}
        value={attendee.name}
      />

      {/* 2. School (স্কুলঃ) */}
      <FieldTextRow
        top="54.4%"
        height="6.5%"
        label={config.labelSchool}
        value={attendee.school}
      />

      {/* 3. District / Location (জেলা অবস্থানঃ) */}
      <FieldTextRow
        top="62.9%"
        height="6.4%"
        label={config.labelDistrict}
        value={attendee.district}
      />

      {/* 4. Guests (অতিথিঃ) */}
      <FieldTextRow
        top="70.9%"
        height="6.5%"
        label={config.labelGuests}
        value={attendee.guests}
      />

      {/* 5. Mobile (মোবাইল নম্বরঃ) */}
      <FieldTextRow
        top="78.7%"
        height="6.3%"
        label={config.labelPhone}
        value={attendee.phone}
      />

      {/* Custom Footer Overlay (only if user customized Date or Venue from default) */}
      {isCustomFooter && (
        <div
          className="absolute z-20 flex items-center justify-between px-3 bg-[#eef7f2] rounded-full shadow-sm"
          style={{
            left: '3.6%',
            top: '85.8%',
            width: '92.8%',
            height: '7.2%',
            border: '2.6px solid #0d633d',
          }}
        >
          {/* Date */}
          <div className="flex items-center min-w-0 pr-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#0d633d] text-white flex items-center justify-center shrink-0 mr-1.5">
              <span className="text-[11px]">📅</span>
            </div>
            <span
              className="font-bold text-[#09522e] truncate"
              style={{ fontSize: 'clamp(9px, 1.9cqi, 15px)' }}
            >
              {config.date}
            </span>
          </div>

          {/* Divider */}
          <div className="w-[2px] h-[60%] bg-[#0d633d] mx-1 shrink-0" />

          {/* Venue */}
          <div className="flex items-center min-w-0 pl-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-[#0d633d] text-white flex items-center justify-center shrink-0 mr-1.5">
              <span className="text-[11px]">📍</span>
            </div>
            <span
              className="font-bold text-[#09522e] truncate"
              style={{ fontSize: 'clamp(9px, 1.9cqi, 15px)' }}
            >
              {config.venue}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

interface FieldTextRowProps {
  top: string;
  height: string;
  label: string;
  value: string;
}

const FieldTextRow: React.FC<FieldTextRowProps> = ({ top, height, label, value }) => {
  return (
    <div
      className="absolute z-20 flex items-center px-2 min-w-0"
      style={{
        left: '32.8%',
        width: '53.8%',
        top,
        height,
      }}
    >
      <span
        className="font-bangla font-bold text-[#0a2016] truncate block w-full leading-tight"
        style={{
          fontSize: 'clamp(11px, 2.3cqi, 18px)',
        }}
      >
        <span className="text-[#063b20] mr-1">{label}</span>
        <span className="text-[#0a1826]">{value}</span>
      </span>
    </div>
  );
};
