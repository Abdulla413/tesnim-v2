import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase.config';

interface Meaning {
  id: number;
  de: string;
  ug: string;
  beispiel_de: string;
  beispiel_ug: string;
}

interface SearchItemProps {
  result: {
    id: string;
    deutsch: string;
    uyghur?: string | string[]; // Legacy
    artikel?: string;
    verben?: string; // Legacy stammformen
    satze?: string; // Legacy
    uysatze?: string; // Legacy
    // --- New AI Fields ---
    wortart?: string;
    level?: string;
    stammformen?: string;
    umschrift?: string;
    definition_de?: string;
    definition_ug?: string;
    bedeutungen?: Meaning[];
  };
  onEdit?: (id: string) => void;
}

const SearchItem: React.FC<SearchItemProps> = ({ result, onEdit }) => {
  const [isEditor, setIsEditor] = useState(false);

  useEffect(() => {
    const checkEditor = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setIsEditor(userSnap.data()?.role === 'editor');
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
      }
    };
    checkEditor();
  }, []);

  const handleUtterance = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!result?.deutsch) return;

    const speak = () => {
      window.speechSynthesis.cancel();
      const voices = window.speechSynthesis.getVoices();
      const germanVoice = voices.find((v) => v.lang.startsWith('de')) || null;
      const utterance = new SpeechSynthesisUtterance(result.deutsch);
      utterance.lang = 'de-DE';
      utterance.voice = germanVoice;
      (window as any).lastUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = speak;
    } else {
      speak();
    }
  };

  const handleCopy = async () => {
    // Combine old and new text formats for copying
    const textToCopy = [
      result.artikel,
      result.deutsch,
      result.umschrift ? `(${result.umschrift})` : '',
      result.stammformen || result.verben,
      '---',
      result.bedeutungen 
        ? result.bedeutungen.map(m => `${m.de}: ${m.ug}`).join('\n')
        : (Array.isArray(result.uyghur) ? result.uyghur.join(', ') : result.uyghur),
      '---',
      'Source: www.tesnim.de'
    ].filter(Boolean).join(' ');

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success('مەزمۇن كۆچۈرۈلدى');
    } catch {
      toast.error('كۆچۈرۈش مەغلۇپ بولدى');
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('راستلا ئۆچۈرەمسىز؟');
    if (!confirmDelete || !result.id) return;

    try {
      await deleteDoc(doc(db, 'dictionary', String(result.id)));
      toast.success('سۆز ئۆچۈرۈلدى');
    } catch (error) {
      toast.error('ئۆچۈرۈش مەغلۇپ بولدى');
    }
  };

  return (
    <div className='w-full max-w-md p-2'>
      <div className='bg-white rounded-xl border-t-4 border-blue-600 p-4 shadow-lg'>
        
        {/* Header: Language & Audio */}
        <div className="flex justify-between items-center bg-gray-50 p-2 rounded-t-lg border-b">
          <div className="flex gap-2">
            {result.level && <span className="bg-yellow-400 text-xs font-bold px-2 py-0.5 rounded text-white">{result.level}</span>}
            {result.wortart && <span className="bg-blue-500 text-xs font-bold px-2 py-0.5 rounded text-white">{result.wortart}</span>}
          </div>
          <button onClick={handleUtterance} className="text-blue-600 hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        </div>

        {/* Word and Grammar Section */}
        <div className="my-3">
          <h2 className="text-2xl font-bold text-gray-800 flex items-baseline">
            {result.artikel && <span className="text-sm font-normal text-gray-500 mr-1">{result.artikel}</span>}
            {result.deutsch}
          </h2>
          {result.umschrift && <p className="text-sm text-gray-400 italic">{result.umschrift}</p>}
          {(result.stammformen || result.verben) && (
            <p className="mt-1 text-sm text-blue-800 bg-blue-50 px-2 py-1 rounded">
              {result.stammformen || result.verben}
            </p>
          )}
        </div>

        {/* Meanings Section (The Core) */}
        <div className="border-t pt-2">
          <div className="flex justify-between items-center mb-2">
             <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Uyghurche</span>
             <button onClick={handleCopy} className="text-gray-400 hover:text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
             </button>
          </div>

          {/* Render meanings if available, else render legacy uyghur field */}
          {result.bedeutungen ? (
            result.bedeutungen.map((m) => (
              <div key={m.id} className="mb-4 last:mb-0">
                <div className="flex justify-between items-start gap-4">
                  <p className="text-sm text-gray-600 w-1/2">{m.de}</p>
                  <p className="text-lg font-display text-right w-1/2" dir="rtl">{m.ug}</p>
                </div>
                <div className="mt-1 p-2 bg-gray-50 rounded text-xs italic text-gray-500 border-l-2 border-gray-200">
                  <p>{m.beispiel_de}</p>
                  <p className="text-right mt-1 font-display" dir="rtl">{m.beispiel_ug}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-lg font-display text-right" dir="rtl">
              {Array.isArray(result.uyghur) ? result.uyghur.join('، ') : result.uyghur}
            </div>
          )}
        </div>

        {/* Legacy Sentences */}
        {(result.satze || result.uysatze) && !result.bedeutungen && (
           <div className="mt-3 p-2 bg-gray-100 rounded text-sm">
              {result.satze && <p className="mb-1">{result.satze}</p>}
              {result.uysatze && <p className="text-right font-display" dir="rtl">{result.uysatze}</p>}
           </div>
        )}

        {/* Editor Controls */}
        {isEditor && (
          <div className="flex justify-end mt-4 pt-3 border-t gap-2">
            <button onClick={() => onEdit?.(result.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded-full text-xs shadow-sm transition-colors">
              تەھرىرلەش
            </button>
            <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-full text-xs shadow-sm transition-colors">
              ئۆچۈرۈش
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchItem;