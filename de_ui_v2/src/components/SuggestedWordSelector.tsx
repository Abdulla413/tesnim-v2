import { useEffect, useState } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "../firebase/firebase.config";

interface SuggestedWord {
  id: string;
  deutsch: string;
  uyghur?: string | string[] | null;
  used?: boolean;
}

interface SuggestedWordSelectorProps {
  onSelect: (word: SuggestedWord) => void;
  refreshTrigger?: number; // optional trigger
}

const SuggestedWordSelector: React.FC<SuggestedWordSelectorProps> = ({
  onSelect,
  refreshTrigger,
}) => {
  const [suggestedWords, setSuggestedWords] = useState<SuggestedWord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const q = query(collection(db, "suggested_words"), limit(100));
        const querySnapshot = await getDocs(q);

        const words: SuggestedWord[] = querySnapshot.docs
  .map((doc) => {
    const data = doc.data() as Omit<SuggestedWord, "id">;
    return {
      id: doc.id,
      ...data,
    };
  })
  .filter((w) => w.used !== true);


        setSuggestedWords(words);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      }
    };

    fetchSuggestions();
  }, [refreshTrigger]);

  const handleSelect = (word: SuggestedWord) => {
    setSelectedId(word.id);
    onSelect({
      ...word,
      uyghur:
        typeof word.uyghur === "string"
          ? [word.uyghur]
          : Array.isArray(word.uyghur)
          ? word.uyghur
          : [],
    });
  };

  return (
    <div className="mb-4">
      <label className="block font-bold mb-1 font-display">تەكلىپلەر:</label>
      <select
        className="w-full p-3 border rounded bg-gray-50"
        value={selectedId || ""}
        onChange={(e) => {
          const selected = suggestedWords.find((w) => w.id === e.target.value);
          if (selected) handleSelect(selected);
        }}
      >
        <option value="">-- سۆز تاللاڭ --</option>
        {suggestedWords.map((word) => (
          <option key={word.id} value={word.id}>
            {word.deutsch}
            {word.uyghur
              ? ` - ${
                  Array.isArray(word.uyghur)
                    ? word.uyghur.join(", ")
                    : word.uyghur
                }`
              : ""}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SuggestedWordSelector;
