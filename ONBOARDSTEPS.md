Below is a **structured onboarding step-by-step breakdown** for **OnboardLink’s Enhanced Due Diligence** process — fully aligned with secure Firebase Storage integration, organized folder structure, and modular handling of multiple file uploads per field.

This guide will ensure:

* A scalable, maintainable structure in Firebase.
* Clean file organization: `UserEmail/CompanyName/OnboardingStep/FieldName/file(s)`
* File renaming using field labels.
* Support for multiple file uploads where required.
* Steps reordered by importance and compliance sensitivity.

---

```markdown
# 📁 Enhanced Due Diligence Onboarding Steps  
**For IMTO Partners via OnboardLink**

---

## 🔐 Firebase Folder Structure (Per Submission)

```

/\[UserEmail]/
└── \[CompanyName]/
└── \[StepName]/
└── \[FieldName]/
├── fieldname\_1.pdf
├── fieldname\_2.jpg
└── ...

```

> 🔄 Files are renamed to follow:  
> `fieldname_1.extension`  
> (e.g. `certificateofincorporation_doc1.pdf`)

> 📎 Multiple file uploads allowed on designated fields.

---

## 🧾 STEP 1: Company Incorporation & Legal Status

> ✅ Critical for verifying legal existence and shareholding structure.

### 📂 Fields:
A. **Company Website (URL)**
    - *Text-only input field*

B. **Company Name**
    - *Text-only input field*

C. **Company Description**
    - *Text-only input field*

1. **Certificate of Incorporation**
   - *Single file upload*

2. **Memorandum and Articles of Association**
   - *Single file upload*

3. **CAC Status Report (not older than 3 months)**
   - *Single file upload*

4. **Shareholding Documents**
   - Upload **IDs + Incorporation docs** of any shareholder (legal or individual) owning >5%
   - *Multiple file upload*

5. **IDs & BVNs of Directors and >5% Shareholders**
   - *Multiple file upload*
   - Format: `id_directorname.pdf`, `bvn_shareholdername.jpg`

---

## 🧑‍💼 STEP 2: Management & Key Personnel

### 📂 Fields:
6. **Senior Management Details**
   - Upload:
     - Names
     - Positions
     - Identification documents
   - *Multiple file upload*

7. **Compliance Officer ID & Contact**
   - *Single file upload*
   - *Text-only input field*


---

## 📜 STEP 3: Licensing & Regulatory Certification

### 📂 Fields:
8. **IMTO Regulatory License**
   - Upload both:
     - Original license
     - Most recent renewal
   - *Multiple file upload*

9. **Nigerian Data Protection Regulatory Certification (NDPR 2024/2025)**
   - *Single file upload*

10. **Evidence of Data Protection Filing (NDP Commission)**
   - Upload compliance badge or related doc
   - *Single file upload*

11. **Regulatory Questionnaires**
    - `Dully filled Financial Crimes Questionnaire`
    - `Dully filled and signed FCCQ by MLRO`
    - *Multiple file upload allowed (PDF only)*

---

## 🛡️ STEP 4: Policies & Governance

### 📂 Fields:
12. **AML/CFT/CPF Policy**
    - *Single file upload*

13. **KYC Policy**
    - *Single file upload*

14. **Anti-Bribery and Corruption (ABC) Policy**
    - *Single file upload*

15. **Signed Sterling Bank ABC Statement**
    - *Single file upload*

---

## 📍 STEP 5: Business Address Verification

### 📂 Fields:
16. **Evidence of Business Address**
    - *Notarized copy required for foreign entities*
    - *Single file upload*

---

## 🔐 STEP 6: Information & Cyber Security Compliance

> For partners leveraging digital infrastructure

### 📂 Fields:
17. **Information Security - ISO 27001/27002 Certification**
18. **Cyber Security - ISO 27032 Certification**
19. **Cloud Security - ISO 27017 Certification**
20. **Business Continuity - ISO 22301 Certification**

- *Not a required field to complete the onboarding process.*
- Each field allows *single* or *combined multi-page PDF uploads*
- Use descriptive filenames like `iso_27001_cert_2024.pdf`

---

## 📊 STEP 7: Monitoring, Risk, and International Sanctions

### 📂 Fields:
21. **Fraud & Suspicious Transaction Monitoring Capability**
    - Upload documents confirming:
      - Fraud monitoring solution
      - Suspicious transaction reporting capability
    - *Single file or PDF bundle*

22. **Sanctioned Countries Disclosure**
      - *“Do you conduct business with DPRK, Iran, Myanmar?”*
    - *Radio button options: Yes, No*


23. **PEP Declaration (If applicable)**
    - *Radio button options: Yes, No*
    - If any **UBOs or Board Members** are PEPs:
      - Describe:
        - Their role in the company
        - Level of influence
      - *Text-only input field*


---

## ✅ Summary of Technical Considerations

- All documents should be grouped under:
```

/\[UserEmail]/\[CompanyName]/\[Step]/\[Field]/\[file(s)]

```

- All uploads should:
- Be renamed to lowercase field-safe filenames.
- Allow **multiple uploads** where appropriate (Zod schema should accept arrays).

- Firebase Storage Rules:
- Authenticated users only.
- Users can only access their own folder (`UserEmail`-scoped).
- Admins can access all folders.

- Form Handling:
- Use `React Hook Form` with dynamic file array fields
- Zod schema per step with `z.array(z.instanceof(File))` for multi-upload fields
- Use progress bar to indicate % completion of due diligence

---

## 🛠 Recommended Upload Component Features

- File name normalization
- Per-field upload folders
- Drag-and-drop or browse
- Multiple file previews per field
- Inline error validation
- Toast notifications for success/failure
- Skeleton loader on upload start

---

## 🔍 Validation Steps

1. **User Authentication**:
   - Verify user is logged in.
   - Check Firebase auth token.

2. **Form Submission**:
   - Validate against Zod schema.
   - Check file size and type. <= 300KB each file
   - Check file type. Only PDF, JPG, JPEG, PNG allowed.
   - Ensure required fields are filled.

3. **Firebase Storage**:
   - Generate unique file paths.
   - Upload files to Firebase Storage.
   - Update Firestore with file references.

4. **UI Feedback**:
   - Show progress indicators.
   - Display success/error messages.
   - Refresh UI after successful upload.