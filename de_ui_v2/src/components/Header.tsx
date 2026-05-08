import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut} from "firebase/auth";
import type { User} from "firebase/auth";
import { toast } from "react-toastify";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase.config"; 

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string>("viewer");

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

      
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setRole(data.role || "viewer");
          } else {
            setRole("viewer");
          }
        } catch (error) {
          console.error("Failed to fetch user role:", error);
          setRole("viewer");
        }
      } else {
        setUser(null);
        setRole("viewer");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      setUser(null);
      toast.success("چىكىنىش مۇۋەپپەقىيەتلىك بولدى");
    } catch (error) {
      toast.error("چىكىنىش مەغلۇپ بولدى");
    }
  };

  return (
    <>
      <header className="bg-blue-700 text-white shadow w-full fixed top-0 left-0 z-50">
        <div className="container mx-auto flex flex-wrap p-4 flex-col md:flex-row items-center">
          <Link to="/">
            <div className="flex title-font font-medium items-center mb-2 md:mb-0">
              <span className="text-xl">TESNIM.DE</span>
            </div>
          </Link>

          <nav
            className="md:ml-auto flex flex-wrap items-center text-base justify-center font-display"
            dir="rtl"
          >
            <Link to="/" className="mx-3 hover:text-gray-300">
              باشبەت
            </Link>

            <Link to="/about" className="mx-3 hover:text-gray-300">
              ھەققىمىزدە
            </Link>

            {user && (
              <>
                <Link to="/dialog" className="mx-3 hover:text-gray-300">
                  دىئالوگ
                </Link>

                {role === "editor" && (
                  <Link to="/addwords" className="mx-3 hover:text-gray-300">
                    سۆز قوشۇش
                  </Link>
                )}
              </>
            )}

            {!user && (
              <>
                <Link
                  to="/register"
                  className="hover:text-gray-300 bg-red-700 rounded px-3 pt-1"
                >
                  تىزىملىتىش
                </Link>
                <Link
                  to="/login"
                  className="hover:text-gray-300 bg-green-700 rounded px-3 pt-1 mx-2"
                >
                  كىرىش
                </Link>
              </>
            )}

            {user && (
              <>
                <span className="mx-2 text-yellow-200 font-bold">
                  {user.displayName || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="mx-3 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  چىكىنىش
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Add spacing below header */}
      <div className="h-20"></div>
    </>
  );
}
