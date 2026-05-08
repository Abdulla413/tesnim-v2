import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase.config";
import { toast } from "react-toastify";
import {  HiPlusCircle, HiMinusCircle } from "react-icons/hi";
export default function EditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    deutsch: "",
    artikel: "",
    plural: "",
    verben: "",
    satze: "",
    uysatze: "",
  });
  const [uyghur, setUyghur] = useState<string[]>([""]);

  useEffect(() => {
    const fetchWord = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, "dictionary", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            deutsch: data.deutsch || "",
            artikel: data.artikel || "",
            plural: data.plural || "",
            verben: data.verben || "",
            satze: data.satze || "",
            uysatze: data.uysatze || "",
          });


          setUyghur(() => {
         if (Array.isArray(data.uyghur)) return data.uyghur.filter(Boolean);
         if (typeof data.uyghur === "string") return [data.uyghur.trim()];
         return [""];
});

        } else {
          toast.error("سۆز تېپىلمىدى");
          navigate("/");
        }
      } catch (err) {
        console.error(err);
        toast.error("خاتالىق كۆرۈلدى");
      } finally {
        setLoading(false);
      }
    };

    fetchWord();
  }, [id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleUyghurChange = (index: number, value: string) => {
    setUyghur((prev) => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const addUyghurField = () => {
    setUyghur((prev) => [...prev, ""]);
  };

  const removeUyghurField = (index: number) => {
    setUyghur((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.deutsch.trim() || uyghur.every((u) => !u.trim())) {
      toast.error("گىرمانچە ۋە ئۇيغۇرچە مەجبۇرىي");
      return;
    }

    setLoading(true);
    try {
      const docRef = doc(db, "dictionary", id!);
      await updateDoc(docRef, {
        ...formData,
        uyghur: uyghur.map((s) => s.trim()).filter(Boolean),
        deutsch_lower: formData.deutsch.trim().toLowerCase(),
        updatedAt: serverTimestamp(),
      });
      toast.success("سۆز يېڭىلاندى");
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("يېڭىلاش مەغلۇپ بولدى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen flex flex-col items-center bg-gray-100 p-4 font-alkatip">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white p-6 rounded shadow-md"
      >
        <h1 className="text-2xl mb-6 text-center font-display-tom">
          سۆز تەھرىرلەش
        </h1>

        <input
          type="text"
          name="deutsch"
          value={formData.deutsch}
          onChange={handleChange}
          placeholder="گىرمانچە سۆز"
          className="w-full p-3 border rounded mb-4 font-display"
          required
        />

        <input
          type="text"
          name="artikel"
          value={formData.artikel}
          onChange={handleChange}
          placeholder="Artikel"
          className="w-full p-3 border rounded mb-4"
        />

        <input
          type="text"
          name="plural"
          value={formData.plural}
          onChange={handleChange}
          placeholder="Plural"
          className="w-full p-3 border rounded mb-4"
        />

        <input
          type="text"
          name="verben"
          value={formData.verben}
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
              required={index === 0}
            />
            {index === uyghur.length - 1 ? (
              <button
                type="button"
                onClick={addUyghurField}
                className="ml-2 text-green-600"
                aria-label="Add Uyghur field"
              >
                <HiPlusCircle size={24} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => removeUyghurField(index)}
                className="ml-2 text-red-600"
                aria-label="Remove Uyghur field"
              >
                <HiMinusCircle size={24} />
              </button>
            )}
          </div>
        ))}

        <textarea
          name="satze"
          value={formData.satze}
          onChange={handleChange}
          placeholder="Deutscher Satz"
          className="w-full p-3 border rounded mb-4"
        />
        <textarea
          name="uysatze"
          value={formData.uysatze}
          onChange={handleChange}
          placeholder="ئۇيغۇرچە جۈملە"
          className="w-full p-3 border rounded mb-4 font-display"
          dir="auto"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-700 text-white py-3 rounded hover:bg-blue-800 font-display"
        >
          {loading ? "يوللىنىۋاتىدۇ..." : "يېڭىلاش"}
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
