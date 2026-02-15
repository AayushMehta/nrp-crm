import React from "react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The onboarding wizard provides its own full-screen layout, 
  // so we just pass through children without any wrapper
  return <>{children}</>;
}
