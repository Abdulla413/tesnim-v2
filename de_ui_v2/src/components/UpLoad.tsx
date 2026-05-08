import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/firebase.config";
import data from "../de_ui_v2/lughets.json"; // Adjust path if needed

function UploadDictionary() {
  const uploadData = async () => {
    try {
      for (const entry of data) {
        await addDoc(collection(db, "dictionary"), entry);
      }
      console.log("✅ Dictionary uploaded successfully!");
    } catch (error) {
      console.error("❌ Error uploading data:", error);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={uploadData}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
      >
        Upload Dictionary to Firestore
      </button>
    </div>
  );
}

export default UploadDictionary;
