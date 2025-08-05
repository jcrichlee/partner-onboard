
import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, Timestamp, serverTimestamp, deleteDoc, arrayUnion } from "firebase/firestore";
import { db } from "./firebase/client";
import { auth } from "./firebase/client";

export type OnboardingFile = {
    name: string;
    url: string;
    storagePath: string; // The full path in Firebase Storage
    category: string;
    fieldName: string;
    uploadedAt: string; // ISO 8601 string
    size?: number | undefined; // File size in bytes
};

export type TimelineEvent = {
    icon: string;
    title: string;
    actor: string;
    date: string; // ISO 8601 date string
    content: string;
    category?: string;
};

export type ChatMessage = {
    from: 'admin' | 'partner';
    text: string;
    time: string; // ISO 8601 date string
    category: string;
    adminName?: string;
    resolved?: boolean;
    mentions?: string[]; // Array of user IDs
};

export type SectionStatus = 'pending' | 'approved' | 'changesRequested';

// This defines the structure of the data for a single partner's onboarding application
export type OnboardingSubmission = {
    id: string;
    partnerId: string;
    partnerName: string; // This could be company name
    partnerEmail?: string; // This will be added
    status: 'Not Started' | 'In Progress' | 'Submitted' | 'Requires Attention' | 'Approved' | 'Rejected';
    lastUpdated: string;
    createdAt: string;
    timeline: TimelineEvent[];
    files: OnboardingFile[];
    chat?: ChatMessage[];
    sectionStatus?: Record<string, SectionStatus>;

    // Step 1: Company Information
    companyName?: string;
    businessDescription?: string;
    companyUrl?: string;
    
    // Step 2: Compliance
    pepDisclosure?: 'yes' | 'no';
    pepDetails?: string;

    // Step 3: Security
    hasComplianceOfficer?: boolean;
    hasSecurityAudits?: boolean;
};

// Type for the data used to create a submission
export type SubmissionCreationData = Omit<OnboardingSubmission, 'id' | 'lastUpdated' | 'createdAt' | 'timeline' | 'files' | 'status'>;


export type StagePermission = 'view' | 'comment';
export type StagePermissionsMap = Record<string, StagePermission[]>;

export type UserNotification = {
    id: string;
    message: string;
    link: string; // Link to the submission
    read: boolean;
    createdAt: string; // ISO string
}

export type UserProfile = {
    id: string;
    email: string;
    role: 'admin' | 'superadmin' | 'partner';
    stagePermissions?: StagePermissionsMap;
    canManageUsers?: boolean;
    disabled?: boolean;
    notifications?: UserNotification[];
};

export type DashboardMetrics = {
    totalPartners: number;
    completedOnboards: number;
    totalAdmins: number;
    totalFileSize: number; // in bytes
};


export async function getDashboardMetrics(): Promise<DashboardMetrics> {
    const usersQuery = query(collection(db, "users"));
    const submissionsQuery = query(collection(db, "onboardingSubmissions"));

    const [usersSnapshot, submissionsSnapshot] = await Promise.all([
        getDocs(usersQuery),
        getDocs(submissionsQuery),
    ]);

    let totalPartners = 0;
    let totalAdmins = 0;
    usersSnapshot.forEach(doc => {
        const user = doc.data() as UserProfile;
        if (user.role === 'partner') {
            totalPartners++;
        } else if (user.role === 'admin' || user.role === 'superadmin') {
            totalAdmins++;
        }
    });

    let completedOnboards = 0;
    let totalFileSize = 0;
    submissionsSnapshot.forEach(doc => {
        const submission = doc.data() as OnboardingSubmission;
        if (submission.status === 'Approved') {
            completedOnboards++;
        }
        if (submission.files && Array.isArray(submission.files)) {
             totalFileSize += submission.files.reduce((acc, file) => acc + (file.size || 0), 0);
        }
    });

    return { totalPartners, completedOnboards, totalAdmins, totalFileSize };
}


export async function getSubmissions(): Promise<OnboardingSubmission[]> {
    const submissionsQuery = query(collection(db, "onboardingSubmissions"));
    const usersQuery = query(collection(db, "users"));
    
    const [submissionsSnapshot, usersSnapshot] = await Promise.all([
        getDocs(submissionsQuery),
        getDocs(usersQuery)
    ]);

    const usersMap = new Map<string, UserProfile>();
    usersSnapshot.forEach(doc => usersMap.set(doc.id, { id: doc.id, ...doc.data() } as UserProfile));

    return submissionsSnapshot.docs.map(doc => {
        const data = doc.data() as Omit<OnboardingSubmission, 'id'>;
        const user = usersMap.get(data.partnerId);

        return {
            id: doc.id,
            ...data,
            partnerEmail: user?.email || 'N/A',
            lastUpdated: (data.lastUpdated as unknown as Timestamp).toDate().toISOString(),
            createdAt: (data.createdAt as unknown as Timestamp).toDate().toISOString(),
            timeline: (data.timeline || []).map((t: any) => ({ ...t, date: (t.date instanceof Timestamp ? t.date.toDate().toISOString() : new Date(t.date).toISOString()) })),
            chat: (data.chat || []).map((c: any) => ({...c, time: (c.time instanceof Timestamp ? c.time.toDate().toISOString() : new Date(c.time).toISOString()) })),
        }
    });
}

export async function getSubmissionForUser(userId: string): Promise<OnboardingSubmission | null> {
    const q = query(collection(db, "onboardingSubmissions"), where("partnerId", "==", userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return null;
    }

    const docSnapshot = querySnapshot.docs[0];
    if (!docSnapshot) {
        return null;
    }
    const data = docSnapshot.data();
    return {
        id: docSnapshot.id,
        ...data,
        lastUpdated: (data.lastUpdated as Timestamp).toDate().toISOString(),
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        timeline: (data.timeline || []).map((t: any) => ({ ...t, date: (t.date instanceof Timestamp ? t.date.toDate().toISOString() : new Date(t.date).toISOString()) })),
        chat: (data.chat || []).map((c: any) => ({...c, time: (c.time instanceof Timestamp ? c.time.toDate().toISOString() : new Date(c.time).toISOString()) })),
    } as unknown as OnboardingSubmission;
}

export async function getSubmissionById(submissionId: string): Promise<OnboardingSubmission | null> {
    const docRef = doc(db, "onboardingSubmissions", submissionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        const data = docSnap.data();
        const user = await getUserById(data.partnerId);
        return {
            id: docSnap.id,
            ...data,
            partnerEmail: user?.email || 'N/A',
            lastUpdated: (data.lastUpdated as Timestamp).toDate().toISOString(),
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
            timeline: (data.timeline || []).map((t: any) => ({ ...t, date: (t.date instanceof Timestamp ? t.date.toDate().toISOString() : new Date(t.date).toISOString()) })),
            chat: (data.chat || []).map((c: any) => ({...c, time: (c.time instanceof Timestamp ? c.time.toDate().toISOString() : new Date(c.time).toISOString()) })),
        } as OnboardingSubmission;
    } else {
        return null;
    }
}


export async function getOrCreateSubmissionForUser(): Promise<OnboardingSubmission> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const existingSubmission = await getSubmissionForUser(user.uid);
    if (existingSubmission) {
        return existingSubmission;
    }
    
    // Create a new submission
    const newSubmissionData = {
        partnerId: user.uid,
        partnerName: "New Partner", // Default name, to be updated in step 1
        status: 'In Progress',
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        timeline: [
            {
                icon: 'submitted',
                title: 'Application Started',
                actor: 'Partner',
                date: new Date().toISOString(),
                content: 'The onboarding application was initiated.'
            }
        ],
        files: [],
        chat: [],
        sectionStatus: {
            'Company Information': 'pending',
            'Compliance': 'pending',
            'Security': 'pending',
            'Attestations': 'pending'
        },
        companyName: '',
        businessDescription: '',
        companyUrl: '',
        pepDisclosure: 'no',
        pepDetails: '',
        hasComplianceOfficer: false,
        hasSecurityAudits: false,
    };

    const docRef = await addDoc(collection(db, "onboardingSubmissions"), newSubmissionData);
    
    const newDocSnap = await getDoc(docRef);
    const data = newDocSnap.data();

    if (!data) {
        throw new Error("Failed to create submission");
    }

    // After creating, we immediately fetch it. The timestamps will be populated by the server.
    return {
        id: docRef.id,
        ...data,
        lastUpdated: (data.lastUpdated as Timestamp).toDate().toISOString(),
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
        timeline: (data.timeline || []).map((t: any) => ({ ...t, date: (t.date instanceof Timestamp ? t.date.toDate().toISOString() : new Date(t.date).toISOString()) })),
        chat: (data.chat || []).map((c: any) => ({...c, time: (c.time instanceof Timestamp ? c.time.toDate().toISOString() : new Date(c.time).toISOString()) })),
    } as unknown as OnboardingSubmission;
}


export async function updateSubmission(submissionId: string, data: Partial<OnboardingSubmission>) {
    const docRef = doc(db, "onboardingSubmissions", submissionId);
    
    const updateData: {[key: string]: any} = { ...data };
    
    // Convert string dates back to Timestamps if they exist
    if (data.timeline) {
        updateData.timeline = data.timeline.map(t => ({...t, date: Timestamp.fromDate(new Date(t.date)) }));
    }
     if (data.chat) {
        updateData.chat = data.chat.map(c => ({...c, time: Timestamp.fromDate(new Date(c.time)) }));
    }

    updateData.lastUpdated = serverTimestamp();
    
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.partnerEmail;

    await updateDoc(docRef, updateData);
}

export async function getAllUsers(): Promise<UserProfile[]> {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    })) as UserProfile[];
    return usersList;
}

export async function getUserById(userId: string): Promise<UserProfile | null> {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() } as UserProfile;
    }
    return null;
}

export async function updateUser(userId: string, data: Partial<UserProfile>) {
    const userDocRef = doc(db, 'users', userId);
    const updateData: { [key: string]: any } = { ...data };

    if (updateData.notifications && Array.isArray(data.notifications)) {
        // If it's a direct array replacement, not using arrayUnion
        const currentUserProfile = await getUserById(userId);
        if (currentUserProfile && JSON.stringify(currentUserProfile.notifications) !== JSON.stringify(data.notifications)) {
             updateData.notifications = data.notifications;
        } else if (updateData.notifications?.[0]?.id) { // Check if it's a notification object for arrayUnion
            updateData.notifications = arrayUnion(...updateData.notifications);
        }
    }

    delete updateData.id; // Don't try to write the id field
    await updateDoc(userDocRef, updateData);
}

export async function deleteUser(userId: string) {
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);
    // Note: Deleting from Firebase Auth requires a backend function (e.g., Cloud Function)
    // for security reasons. This function only deletes the Firestore record.
}
