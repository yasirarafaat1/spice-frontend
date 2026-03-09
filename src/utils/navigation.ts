// utils/navigation.ts
import { useNavigate, NavigateOptions } from "react-router-dom";

/**
 * Hook for navigating inside React components.
 * Recommended for all components.
 */
export function useNavigation() {
  const navigate = useNavigate();

  return {
    go: (path: string, options?: NavigateOptions) => {
      const clean = path.startsWith("/") ? path : `/${path}`;
      navigate(clean, options);
    },
    replace: (path: string) => {
      const clean = path.startsWith("/") ? path : `/${path}`;
      navigate(clean, { replace: true });
    },
    back: () => navigate(-1),
  };
}