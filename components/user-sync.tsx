"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export default function UserSync() {
  const { user: clerkUser, isLoaded } = useUser();
  const convexUser = useQuery(api.users.getCurrentUser);
  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    // Only proceed if Clerk has loaded and user is signed in
    if (!isLoaded || !clerkUser) {
      return;
    }

    // If user doesn't exist in Convex, create them
    if (convexUser === null) {
      createUser({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        firstName: clerkUser.firstName || undefined,
        lastName: clerkUser.lastName || undefined,
        imageUrl: clerkUser.imageUrl || undefined,
        username: clerkUser.username || undefined,
      });
    }
  }, [isLoaded, clerkUser, convexUser, createUser]);

  // This component doesn't render anything
  return null;
}
