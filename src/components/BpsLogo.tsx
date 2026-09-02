import React from 'react';

interface BpsLogoProps {
  className?: string;
}

export const BpsLogo: React.FC<BpsLogoProps> = ({ className = 'w-14 h-14' }) => {
  return (
    <div className={`relative flex items-center justify-center flex-shrink-0 ${className}`}>
      <svg
        viewBox="0 0 420 520"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain"
      >
        {/* Orbital Ring - Orange (Upper Right Arc) */}
        <path
          d="M 105 105 C 240 20, 395 55, 412 185 C 428 300, 375 425, 335 450"
          stroke="#FF7A00"
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
        />

        {/* Orbital Ring - Cyan (Lower Left Arc) */}
        <path
          d="M 360 435 C 240 515, 45 490, 15 350 C -12 215, 60 90, 145 40"
          stroke="#00E5FF"
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
        />

        {/* 1. Top-Left Cyan Shape ('b' component) */}
        <path
          d="M 80 8 C 98 0, 140 0, 150 10 L 125 155 L 198 155 C 205 155, 210 160, 210 170 L 195 320 C 193 328, 185 332, 175 330 L 138 330 L 85 390 C 82 393, 76 393, 73 388 L 68 380 C 65 375, 66 368, 70 360 L 115 170 L 60 170 C 53 170, 50 165, 52 158 L 75 18 C 77 12, 80 8, 80 8 Z"
          fill="#00E5FF"
        />

        {/* 2. Top-Right Orange Shape ('s' component) */}
        <path
          d="M 235 6 C 250 0, 315 0, 340 10 C 322 25, 295 55, 290 85 L 260 170 L 355 170 C 363 170, 368 175, 368 185 L 350 325 C 348 335, 340 340, 330 340 L 265 340 C 260 340, 255 335, 256 328 L 280 215 L 210 215 C 202 215, 198 210, 200 202 L 225 18 C 228 10, 230 6, 235 6 Z"
          fill="#FF7700"
        />

        {/* 3. Bottom Lime-Green Shape ('p' component) */}
        <path
          d="M 205 190 C 213 190, 218 195, 216 205 L 180 345 L 245 345 C 253 345, 258 350, 258 358 L 240 445 C 238 455, 230 460, 220 460 L 165 460 L 105 515 C 100 520, 92 520, 87 515 L 68 515 C 60 515, 58 505, 62 495 L 145 355 L 95 355 C 87 355, 82 350, 84 340 L 115 205 C 117 195, 125 190, 135 190 Z"
          fill="#62E200"
        />
      </svg>
    </div>
  );
};

