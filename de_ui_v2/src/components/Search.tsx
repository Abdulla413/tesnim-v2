import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  setDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-toastify";
import { db } from "../firebase/firebase.config";
import SearchItem from "./SearchItem";
import { getAIWordData } from "../api/openai_api"; // Ensure this path is correct

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
        // 1. First, search Firestore for an exact match or prefix
        const q = query(
          collection(db, "dictionary"),
          where("deutsch_lower", ">=", lower),
          where("deutsch_lower", "<=", lower + "\uf8ff")
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));

        if (data.length > 0) {
          // Found existing data in DB
          setResults(data);
          setShowSuggest(false);
          setSuggested(false);
        } else {
          // 2. Not in DB -> Trigger AI Fallback
          // We only call AI if the searchTerm is at least 2 characters to avoid junk calls
          if (lower.length >= 2) {
            console.log("Word not found in DB. Fetching from AI...");
            const aiData = await getAIWordData(lower);

            if (aiData && aiData.deutsch) {
              const newEntry = {
                ...aiData,
                deutsch_lower: lower,
                isVerified: false, // For your weekly dashboard check
                source: "AI_OpenAI",
                createdAt: new Date().toISOString(),
              };

              setResults([newEntry]);
              setShowSuggest(false);

              // 3. SILENT STORE: Save to Firestore automatically
              // We use the lowercase word as the Document ID to prevent duplicates
              await setDoc(doc(db, "dictionary", lower), newEntry);
            } else {
              // AI couldn't find a translation either
              setResults([]);
              setShowSuggest(true);
            }
          }
        }
      } catch (err) {
        console.error("Search error:", err);
        toast.error("ئىزدەش خاتالىقى كۆرۈلدى");
      } finally {
        setLoading(false);
      }
    }, 800); // 800ms debounce gives the user time to finish the word

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
      {/* Search Input */}
      <div className="relative">
        <input
          type="search"
          placeholder="گىرمانچە سۆز كىرگۈزۈڭ"
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 font-display rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          dir="auto"
        />
        {searchTerm && (
           <button 
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
           >
             ✕
           </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center mt-10 space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-.3s]"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce [animation-delay:-.5s]"></div>
          <p className="text-gray-500 font-display mr-2">ئىزدەۋاتىدۇ...</p>
        </div>
      )}

      {/* Results Rendering */}
      <div className="mt-4 flex flex-col items-center">
        {!loading &&
          results.map((result, index) => (
            <SearchItem
              key={result.id || index}
              result={result}
              onEdit={(id) => navigate(`/editpage/${id}`)}
            />
          ))}
      </div>

      {/* Suggest Box (If AI and DB both fail) */}
      {!loading && showSuggest && !suggested && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm">
          <p className="text-gray-700 font-display mb-4 text-center">
            بۇ سۆز تېپىلمىدى، لوغەت ئۈچۈن تەۋىسسىيە قىلامسىز؟
          </p>

          <textarea
            value={uyghurInput}
            onChange={(e) => setUyghurInput(e.target.value)}
            placeholder="ئۇيغۇرچە تەرجىمىسى (تاپقان بولسىڭىز قوشۇپ قويۇڭ)"
            className="w-full border border-gray-200 rounded-lg p-3 mb-4 font-display focus:ring-2 focus:ring-yellow-400 outline-none"
            rows={2}
            dir="auto"
          />

          <button
            onClick={handleSuggest}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-display font-bold transition-colors"
          >
            ھەئە، تەۋسىيە قىلىمەن
          </button>
        </div>
      )}

      {suggested && (
        <div className="mt-10 p-4 bg-green-50 rounded-lg border border-green-200">
           <p className="text-green-700 text-center font-display">
            رەھمەت! سۆز تەۋسىيە قىلىندى. بىز ئۇنى تەكشۈرۈپ لوغەتكە قوشىمىز.
          </p>
        </div>
      )}
    </div>
  );
}