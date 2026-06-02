import { useLogoutMutation, useMeMutation } from "@/features/authApi";
import { logout as clearAuth, setCredentials } from "@/features/authSlice";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "./Spinner";
import { RootState } from "@/store";
import Image from "next/image";
import voto from "public/voto-full.png";

const Session = ({ children }: { children: React.ReactElement }) => {
  const [getMe] = useMeMutation();
  const [logout] = useLogoutMutation();
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [loading, setLoading] = useState(false);

  const clearSessionAndRedirect = useCallback(async () => {
    dispatch(clearAuth());

    try {
      await logout().unwrap();
    } catch (error) {
      // Ignore logout failures and still send the user back.
    }

    await router.replace(process.env.NEXT_PUBLIC_URL!);
  }, [dispatch, logout, router]);

  useEffect(() => {
    if (
      router.pathname === "/organisation/register" ||
      router.pathname === "/organisation/login" ||
      router.pathname === "/voter/login" ||
      router.pathname === "/organisation/voters/[id]/register" ||
      router.pathname === "/organisation/voters/[id]/verify" ||
      router.pathname === "/organisation/candidates/[id]/create" ||
      router.pathname === "/auth/forgot-password" ||
      router.pathname === "/auth/reset-password/[token]" ||
      router.pathname === "/voter/elections/[id]" ||
      router.pathname === "/voter/elections/category/[id]"
    ) {
      return;
    }

    if (isAuthenticated) return;

    setLoading(true);

    const fetchData = async () => {
      try {
        const { user } = await getMe().unwrap();
        if (!user) {
          await clearSessionAndRedirect();
          return;
        }
        dispatch(setCredentials(user));
      } catch (error) {
        await clearSessionAndRedirect();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    clearSessionAndRedirect,
    dispatch,
    getMe,
    isAuthenticated,
    router.pathname,
  ]);

  if (loading && router.pathname !== "/") {
    return (
      <section className="h-screen flex items-center justify-center flex-col">
        <div>
          <Image src={voto} className="w-[7rem]" alt="logo" />
        </div>

        <div className="mt-6">
          <div className="spinner-line"></div>
        </div>
      </section>
    );
  }

  return <>{children}</>;
};

export default Session;
