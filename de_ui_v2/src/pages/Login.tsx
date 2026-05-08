import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";
import { auth } from "../firebase/firebase.config";
import Spinner from "../components/Spinner";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { email, password } = formData;

  // Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("مۇۋاپىقىيەتلىك كىرىلدى");
      navigate("/");
    } catch (error: any) {
      console.error(error);
      let message = "كىرىشتا خاتالىق كۆرۈلدى";

      if (error.code === "auth/user-not-found") {
        message = "بۇ ئېمىل تىزىملىتىلمىگەن";
      } else if (error.code === "auth/wrong-password") {
        message = "مەخپى نۇمۇر خاتا";
      } else if (error.code === "auth/invalid-email") {
        message = "ئىناۋەتسىز ئېمىل";
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <section>
      <form onSubmit={onSubmit}>
        <div className="bg-grey-200 min-h-screen flex flex-col font-display-tom">
          <div className="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2">
            <div className="bg-white px-6 py-8 rounded shadow-md text-black w-full">
              <h1 className="mb-8 text-3xl text-center">كىرىش</h1>

              <input
                type="email"
                className="block border border-grey-light w-full p-3 rounded mb-4"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="ئېمىل"
                required
              />

              <input
                type="password"
                className="block border border-grey-light w-full p-3 rounded mb-4"
                name="password"
                value={password}
                onChange={onChange}
                placeholder="مەخپى نۇمۇر"
                required
              />

              <button
                type="submit"
                className="w-full text-center py-3 rounded bg-blue-700 text-white hover:bg-blue-800 focus:outline-none my-1"
              >
                كىرىش
              </button>
            </div>

            <div className="text-grey-dark mt-6">
              تەھرىرلەش ھېسابىڭىز بولمىسا؟{" "}
              <Link
                className="no-underline border-b border-blue-600 text-blue-800 font-bold px-2"
                to="/register"
              >
                تىزىملىتىڭ
              </Link>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}

export default Login;
