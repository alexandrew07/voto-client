import React from "react";

type RoundProgressBarProps = {
  progress: number;
  title: string;
};

const RoundProgressBar: React.FC<RoundProgressBarProps> = ({
  progress,
  title,
}) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="">
      <svg className="" width="80" height="80">
        <circle
          className="progress-ring-circle"
          stroke="#FAA9C6"
          strokeWidth="7"
          fill="transparent"
          r={radius}
          cx="40"
          cy="40"
        />
        <circle
          className="progress-ring-circle"
          stroke="#F169F4"
          strokeWidth="7"
          fill="transparent"
          r={radius}
          cx="40"
          cy="40"
          style={{ strokeDasharray: circumference, strokeDashoffset: offset }}
        />
        <text
          className="text-[13px] text-[#FC58B3]"
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
        >
          {progress}
        </text>
      </svg>
    </div>
  );
};

export default RoundProgressBar;
