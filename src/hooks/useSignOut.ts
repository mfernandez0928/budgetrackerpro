import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebase";
import { showToast } from "../components/Toast";

export function useSignOut() {
  const navigate = useNavigate();

  return async () => {
    await signOut(auth);
    showToast("Signed out.", "success");
    navigate("/auth", { replace: true });
  };
}
