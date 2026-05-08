import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";

import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "../firebase/firebase.config";
import SearchItem from "./SearchItem";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const [uyghurInput, setUyghurInput] = useState("");
  const [suggested, setSuggested] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setShowSuggest(false);
      return;
    }

    const delay = setTimeout(async () => {
      setLoading(true);
      const lower = searchTerm.trim().toLowerCase();

      try {
        const q = query(
          collection(db, "dictionary"),
          where("deutsch_lower", ">=", lower),
          where("deutsch_lower", "<=", lower + "\uf8ff")
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => {
          const docData = doc.data();
          return {
            ...docData,
            id: doc.id, // overwrite with Firestore ID
          };
        });

        setResults(data);
        setShowSuggest(data.length === 0);
        setSuggested(false);
      } catch (err) {
        console.error("Search error:", err);
        toast.error("ئىزدەش خاتالىقى كۆرۈلدى");
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleSuggest = async () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      toast.error("گىرمانچە سۆزنى كىرگۈزۈڭ");
      return;
    }

    try {
      const suggestionsRef = collection(db, "suggested_words");
      const existing = await getDocs(
        query(suggestionsRef, where("deutsch_lower", "==", term))
      );

      if (!existing.empty) {
        toast.info("بۇ سۆز ئاللىقاچان تەۋسىيە قىلىنغان");
        return;
      }

      const newSuggestion: any = {
        deutsch: searchTerm.trim(),
        deutsch_lower: term,
        suggestedBy: "anonymous",
        createdAt: serverTimestamp(),
      };

      if (uyghurInput.trim()) {
        newSuggestion.uyghur = uyghurInput.trim();
      }

      await addDoc(suggestionsRef, newSuggestion);

      toast.success("سۆز تەۋسىيە قىلىندى");
      setSuggested(true);
      setSearchTerm("");
      setUyghurInput("");
    } catch (err) {
      console.error("Suggest error:", err);
      toast.error("تەۋسىيە قىلىش مەغلۇپ بولدى");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <input
        type="search"
        placeholder="گىرمانچە سۆز كىرگۈزۈڭ"
        value={searchTerm}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 font-display rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        dir="auto"
      />

      {loading && <p className="text-gray-500 mt-2">ئىزدەۋاتىدۇ...</p>}

      {!loading &&
        results.map((result) => (
          <SearchItem
            key={result.id}
            result={result}
            onEdit={(id) => navigate(`/editpage/${id}`)}
          />
        ))}

      {!loading && showSuggest && !suggested && (
        <div className="mt-6 bg-yellow-50 border border-yellow-300 rounded p-4">
          <p className="text-red-600 font-display mb-2">
            بۇ سۆز تېپىلمىدى، لوغەت ئۈچۈن تەۋىسسىيە قىلامسىز؟
          </p>

          <textarea
            value={uyghurInput}
            onChange={(e) => setUyghurInput(e.target.value)}
            placeholder="ئۇيغۇرچە تەرجىمىسى (تاپقان بولسىڭىز قوشۇپ قويۇڭ)"
            className="w-full border border-gray-300 rounded p-2 mb-2 font-display"
            rows={2}
            dir="auto"
          />

          <button
            onClick={handleSuggest}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 font-display"
          >
            ھەئە، تەۋسىيە قىلىمەن
          </button>
        </div>
      )}

      {suggested && (
        <p className="text-green-600 mt-4 text-center font-display">
          رەھمەت! سۆز تەۋسىيە قىلىندى.
        </p>
      )}
    </div>
  );
}
