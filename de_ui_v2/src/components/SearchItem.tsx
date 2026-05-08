import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase.config';

interface SearchItemProps {
  result: {
    id: string;
    deutsch: string;
    uyghur: string | string[];
    artikel?: string;
    verben?: string;
    satze?: string;
    uysatze?: string;
  };
  onEdit?: (id: string) => void;
}

const SearchItem: React.FC<SearchItemProps> = ({ result, onEdit }) => {
  const [isEditor, setIsEditor] = useState(false);

  // 🔐 Get user role from Firestore
  useEffect(() => {
    console.log(result, "this is result")
    const checkEditor = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const role = userSnap.data()?.role;
          setIsEditor(role === 'editor');
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
      }
    };

    checkEditor();
  }, []);

  const handleUtterance = (e: React.MouseEvent) => {
    e.preventDefault();
    const speak = () => {
      const voices = window.speechSynthesis.getVoices();
      const germanVoice = voices.find((v) => v.lang === 'de-DE' || v.lang.startsWith('de')) || null;

      const utterance = new SpeechSynthesisUtterance(result.deutsch);
      utterance.lang = 'de-DE';
      utterance.voice = germanVoice;
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = speak;
    } else {
      speak();
    }
  };

  const handleCopy = async () => {
    const uyghurText = Array.isArray(result.uyghur)
      ? result.uyghur.join('\n')
      : result.uyghur;

    const text = [
      result.deutsch,
      uyghurText,
      result.verben,
      result.satze,
      result.uysatze,
      'www.tesnim.de',
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(text);
      toast.success('مەزمۇن كۆچۈرۈلدى');
    } catch {
      toast.error('كۆچۈرۈش مەغلۇپ بولدى');
    }
  };

  // const handleDelete = async () => {
  //   const confirm = window.confirm('راستلا ئۆچۈرەمسىز؟');
  //   if (!confirm) return;

  //   try {
  //     if (isEditor){
  //       await deleteDoc(doc(db, 'dictionary', result.id));
  //     toast.success('سۆز ئۆچۈرۈلدى');
      
  //     }
      
  //   } catch (error) {
  //     console.error('Delete error:', error);
  //     toast.error('ئۆچۈرۈش مەغلۇپ بولدى');
  //   }
  // };

  const handleDelete = async () => {
  const confirmDelete = window.confirm('راستلا ئۆچۈرەمسىز؟');
  if (!confirmDelete) return;

  if (typeof result.id !== 'string') {
    console.error('Invalid ID for deletion:', result.id);
    toast.error('سۆزنىڭ ID نۇمۇر تەسىس قىلىنمىدى');
    return;
  }

  try {
    const docId = String(result.id); // 🔧 convert to string
    await deleteDoc(doc(db, 'dictionary', docId));

    toast.success('سۆز ئۆچۈرۈلدى');
  } catch (error) {
    console.error('Delete error:', error);
    toast.error('ئۆچۈرۈش مەغلۇپ بولدى');
  }
};

  
  return (
    <div className='w-full max-w-md p-2'>
      <div className='bg-gray-100 rounded-lg border-t-4 border-green-500 p-2 shadow'>
        <p className="flex items-center bg-green-300 font-dm font-bold text-sm h-7 px-3 pt-1">
          Deutsch
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="ml-1 h-6 w-6 cursor-pointer"
            onClick={handleUtterance}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
            />
          </svg>
        </p>

        <h2 className="font-lora flex mx-3 my-1 text-md">
          {result.artikel && <span>{result.artikel}&nbsp;</span>}
          {result.deutsch}
        </h2>

        {result.verben && (
          <h2 className="px-3 text-md bg-gray-300">{result.verben}</h2>
        )}

        <p className="bg-green-300 h-7 pt-1 px-3 pb-1 font-display font-bold" dir="auto">
          ئۇيغۇرچە
          <svg
            xmlns="http://www.w3.org/2000/svg"
            onClick={handleCopy}
            className="inline-block mr-2 h-6 w-6 cursor-pointer"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </p>

        <div className="mx-3 pb-1 mb-2 my-1 pt-1 font-display" dir="auto">
          {Array.isArray(result.uyghur)
            ? result.uyghur.map((line, idx) => (
                <p key={idx} className="mb-1">
                  {line}
                </p>
              ))
            : <p>{result.uyghur}</p>}
        </div>

        <div className='bg-gray-300'>
          {result.satze && <p className="px-3 text-md">{result.satze}</p>}
          {result.uysatze && (
            <p className="px-3 text-md font-display rounded-lg pt-1" dir="auto">
              {result.uysatze}
            </p>
          )}
        </div>

        {/* ✅ Editor Controls */}
        {isEditor && (
          <div className="flex justify-end mt-2 gap-2">
            <button
            onClick={() => onEdit?.(result.id)}
              className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded text-sm font-display"
            >
              تەھرىرلەش
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-display"
            >
              ئۆچۈرۈش
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchItem;
