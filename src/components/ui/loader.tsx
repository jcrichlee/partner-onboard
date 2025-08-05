
"use client";

export function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin">
            <svg
                width="48"
                height="48"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M50 0L95.11 25V75L50 100L4.89 75V25L50 0Z" fill="#A6192E" />
                <path d="M50 10L86.6 30V70L50 90L13.4 70V30L50 10Z" fill="white" />
                <path d="M50 20L77.94 35V65L50 80L22.06 65V35L50 20Z" fill="#A6192E" />
            </svg>
        </div>
        <p className="text-muted-foreground">Please wait...</p>
      </div>
    </div>
  );
}
