import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  query, 
  where,
  getDocs,
  addDoc,
  collection,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import { PlusCircle, MinusCircle } from "lucide-react";
import SuggestedWordSelector from "../components/SuggestedWordSelector";

function AddWordsPage() {
  const [formData, setFormData] = useState({
    deutsch: "",
    artikel: "",
    plural: "",
    verben: "",
    uyghur: [""],
    satze: "",
    uysatze: "",
  });

  const [loading, setLoading] = useState(false);
  const [accessChecking, setAccessChecking] = useState(true);
  const [isEditor, setIsEditor] = useState(false);
  const navigate = useNavigate();
  const [selectedSuggestionId, setSelectedSuggestionId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { deutsch, artikel, plural, verben, uyghur, satze, uysatze } = formData;

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      toast.error("ھېسابقا كىرىڭ");
      navigate("/login");
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      if (userDoc.exists() && userData?.role === "editor") {
        setIsEditor(true);
      } else {
        toast.error("سىزگە بۇ بەتنى زىيارەت قىلىش ھوقۇقى يوق");
        navigate("/not-authorized");
      }
    } catch (error) {
      toast.error("ھوقۇقنى تەكشۈرۈش مەغلۇپ بولدى");
      console.error("Role check error:", error);
    } finally {
      setAccessChecking(false);
    }
  });

  return () => unsubscribe(); // Clean up
}, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUyghurChange = (index: number, value: string) => {
    const newUyghur = [...uyghur];
    newUyghur[index] = value;
    setFormData((prev) => ({ ...prev, uyghur: newUyghur }));
  };

  const addUyghurField = () => {
    setFormData((prev) => ({ ...prev, uyghur: [...prev.uyghur, ""] }));
  };

  const removeUyghurField = (index: number) => {
    const newUyghur = uyghur.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, uyghur: newUyghur }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deutsch.trim() || uyghur.some((val) => !val.trim())) {
      toast.error("گىرمانچە ۋە ئۇيغۇرچە تەرجىمىسى بوش قالماسلىقى كېرەك");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;


       const q = query(
      collection(db, "dictionary"),
      where("deutsch_lower", "==", deutsch.trim().toLowerCase())
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      toast.error("بۇ سۆز ئاللىقاچان قوشۇلغان");
      setLoading(false);
      return;
    }

      await addDoc(collection(db, "dictionary"), {
        deutsch,
        deutsch_lower: deutsch.toLowerCase(),
        artikel,
        plural,
        verben,
        uyghur,
        satze,
        uysatze,
        createdAt: serverTimestamp(),
        createdBy: user?.uid || null,
        email: user?.email || "anonymous",
      });

      if (selectedSuggestionId) {
        const suggestedRef = doc(db, "suggested_words", selectedSuggestionId);
        await updateDoc(suggestedRef, { used: true });
        setRefreshKey((prev) => prev + 1);
        setSelectedSuggestionId(null);
      }

      toast.success("سۆز مۇۋاپىقىيەتلىك قوشۇلدى");
      setFormData({
        deutsch: "",
        artikel: "",
        plural: "",
        verben: "",
        uyghur: [""],
        satze: "",
        uysatze: "",
      });
      document.querySelector<HTMLInputElement>('input[name="deutsch"]')?.focus();
    } catch (error) {
      console.error("Error adding word:", error);
      toast.error("سۆز قوشۇش مەغلۇپ بولدى");
    } finally {
      setLoading(false);
    }
  };

  if (accessChecking) return <p className="text-center mt-10">يۈكلەۋاتىدۇ...</p>;
  if (!isEditor) return null;

  return (
    <section className="min-h-screen flex flex-col items-center bg-gray-100 p-4 font-alkatip">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white p-6 rounded shadow-md"
      >
        <h1 className="text-2xl mb-6 text-center font-display-tom">
          لۇغەتكە يېڭى سۆز قوشۇش
        </h1>

        <SuggestedWordSelector
          onSelect={(word) => {
            setSelectedSuggestionId(word.id);
            setFormData((prev) => ({
              ...prev,
              deutsch: word.deutsch,
              uyghur: typeof word.uyghur === "string" ? [word.uyghur] : word.uyghur || [""],
            }));
          }}
          refreshTrigger={refreshKey}
        />

        <input
          type="text"
          name="deutsch"
          value={deutsch}
          onChange={handleChange}
          placeholder="گىرمانچە سۆز"
          className="w-full p-3 border rounded mb-4 font-display"
          required
        />

        <input
          type="text"
          name="artikel"
          value={artikel}
          onChange={handleChange}
          placeholder="Artikel"
          className="w-full p-3 border rounded mb-4"
        />

        <input
          type="text"
          name="plural"
          value={plural}
          onChange={handleChange}
          placeholder="Plural"
          className="w-full p-3 border rounded mb-4"
        />

        <input
          type="text"
          name="verben"
          value={verben}
          onChange={handleChange}
          placeholder="Verben"
          className="w-full p-3 border rounded mb-4"
        />

        <label className="block font-bold mb-1 font-display">
          ئۇيغۇرچە تەرجىمىسى:
        </label>
        {uyghur.map((val, index) => (
          <div key={index} className="flex items-center mb-2">
            <input
              type="text"
              value={val}
              onChange={(e) => handleUyghurChange(index, e.target.value)}
              placeholder={`تەرجىمىسى ${index + 1}`}
              className="w-full p-3 border rounded font-display"
              required
            />
            {index === uyghur.length - 1 ? (
              <button
                type="button"
                onClick={addUyghurField}
                className="ml-2 text-green-600"
              >
                <PlusCircle size={24} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => removeUyghurField(index)}
                className="ml-2 text-red-600"
              >
                <MinusCircle size={24} />
              </button>
            )}
          </div>
        ))}

        <textarea
          name="satze"
          value={satze}
          onChange={handleChange}
          placeholder="Deutscher Satz"
          className="w-full p-3 border rounded mb-4"
        />
        <textarea
          name="uysatze"
          value={uysatze}
          onChange={handleChange}
          placeholder="ئۇيغۇرچە جۈملە"
          className="w-full p-3 border rounded mb-4 font-display"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 text-white py-3 rounded hover:bg-blue-800 font-display"
        >
          {loading ? "يوللىنىۋاتىدۇ..." : "تاپشۇرۇش"}
        </button>

        <p dir="rtl" className="text-sm text-gray-600 mt-4 font-display">
          <span className="bg-gray-800 text-white px-2 font-display-tom">
            ئەسكەرتىش
          </span>{" "}
          گىرمانچە سۆزلۈك بىلەن ئۇيغۇرچە تەرجىمىسى بوش قالماسلىقى كېرەك.
          باشقا ئۇچۇرلار بوش قالسىمۇ بولىدۇ.
        </p>
      </form>
    </section>
  );
}

export default AddWordsPage;
