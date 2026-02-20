"use client";

import { useState, useEffect } from "react";

export default function ProfilePage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      setUser({
        fullName: "John Doe",
        email: "johndoe@example.com",
        role: "student",
        imageUrl: "https://i.pravatar.cc/150?img=3",
      });
      setIsLoaded(true);
    }, 1000);
  }, []);

  if (!isLoaded) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-lg bg-surface rounded-2xl shadow-md overflow-hidden">
        <div className="flex items-center gap-6 p-6">
          <img
            src={user?.imageUrl}
            alt={user?.fullName || "User"}
            className="w-28 h-28 rounded-full border-4 border-primary object-cover"
          />
          <div>
            <h1 className="text-2xl font-bold text-text">{user?.fullName}</h1>
            <p className="text-primary text-lg">{user?.email}</p>
          </div>
        </div>
        <div className="border-t border-muted p-6">
          <p className="text-text text-lg">
            Role: <span className="capitalize text-muted">{user?.role}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="p-6 flex justify-center">
      <div className="w-full max-w-lg bg-surface rounded-2xl shadow-md overflow-hidden">
        <div className="flex items-center gap-6 p-6">
          <div className="w-28 h-28 rounded-full bg-muted animate-pulse" />
          <div className="flex flex-col gap-3">
            <div className="w-40 h-6 bg-muted rounded animate-pulse" />
            <div className="w-28 h-4 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="border-t border-muted p-6">
          <div className="w-24 h-4 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
