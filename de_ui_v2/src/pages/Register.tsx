import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase.config";
import Spinner from "../components/Spinner";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password2: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const { name, email, password, password2 } = formData;
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== password2) {
      toast.error("مەخپى  نۇمۇر ماس كەلمىدى");
      return;
    }

    try {
      setIsLoading(true);

      // 1. Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Set displayName in Firebase Auth
      await updateProfile(user, { displayName: name });

      // 3. Add user to Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        role: "viewer", // default role
        createdAt: serverTimestamp(),
      });

      toast.success("تىزىملىتىش مۇۋاپىقىيەتلىك بولدى");
      navigate("/");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("بۇ ئېمىل ئاللاقاچان تېزىملىتىپ بولغان");
      } else {
        toast.error("تىزىملىتىش مەغلۇپ بولدى");
        console.error(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <section>
      <form onSubmit={onSubmit}>
        <div className="bg-grey-100 min-h-screen flex flex-col font-display-tom">
          <div className="container max-w-sm mx-auto flex-1 flex flex-col items-center justify-center px-2">
            <div className="bg-white px-6 py-8 rounded shadow-md text-black w-full">
              <h1 className="mb-8 text-3xl text-center">تىزىملىتىش</h1>

              <input
                type="text"
                className="block border border-grey-light w-full p-3 rounded mb-4"
                name="name"
                value={name}
                onChange={onChange}
                placeholder="ئىسمى"
                required
              />
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
              <input
                type="password"
                className="block border border-grey-light w-full p-3 rounded mb-4"
                name="password2"
                value={password2}
                onChange={onChange}
                placeholder="مەخپى نۇمۇرنى جەزىملەش"
                required
              />

              <button
                type="submit"
                className="w-full text-center py-3 rounded bg-blue-700 text-white hover:bg-green-dark focus:outline-none my-1"
              >
                ھېساب ئېچىش
              </button>
            </div>

            <div className="text-grey-dark mt-6">
              ئاللىقاچان ھېسابىڭىز بارمۇ؟
              <Link
                className="no-underline border-b border-blue-600 text-blue-800 font-bold px-2"
                to="/login"
              >
                كىرىش
              </Link>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}

export default Register;
