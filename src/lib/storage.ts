
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { auth, storage } from "./firebase";
import { OnboardingFile, OnboardingSubmission } from "./firestore";

export async function uploadUserFile(
    file: File,
    submission: OnboardingSubmission,
    category: string,
    fieldName: string
): Promise<OnboardingFile> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User not authenticated. Cannot upload file.");
    }
    
    // Logic to rename the file
    const fileExtension = file.name.split('.').pop();
    const existingFilesCount = submission.files.filter(f => f.fieldName === fieldName).length;
    const newFileName = `${fieldName}-${existingFilesCount + 1}.${fileExtension}`;

    const path = `users/${user.uid}/submissions/${submission.id}/${category}/${fieldName}/${newFileName}`;

    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
        name: newFileName,
        url: downloadURL,
        storagePath: path,
        category: category,
        fieldName: fieldName,
        uploadedAt: new Date().toISOString(),
        size: file.size,
    };
}

export async function deleteUserFile(storagePath: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
        throw new Error("User not authenticated. Cannot delete file.");
    }

    // Basic check to ensure the path seems correct and belongs to the user
    if (!storagePath.startsWith(`users/${user.uid}/`)) {
        throw new Error("User does not have permission to delete this file.");
    }

    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
}
