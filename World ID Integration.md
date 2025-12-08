# World ID Integration in Kinich: Ensuring Human-Generated Training Data for AI

## **Story Protocol SWA Season 2 Buildathon - World ID Challenge Submission**

## The Problem: Training Context vs. Synthetic Data

### The Shift in Sports Data Economics

The sports data economy is undergoing a fundamental transformation. For years, the focus has been on **outcomes**: biometrics (heart rate, sleep, GPS tracking), game statistics (points scored, assists, shots on goal), and competition results. Wearable platforms excel at capturing _what happened_ after the fact.

But outcomes only tell half the story. The missing piece is **training context** — the structured inputs that create performance. The "how" and "why" behind an athlete's results:

- **Physical drill execution**: Rep counts, cadence, range of motion, technique consistency
- **Mental pattern data**: Decision logic, focus states, pre-competition routines, response to adversity

This training context is what elite coaches call "gut instinct" — pattern recognition born from experience. It's the data that explains _why_ one athlete with identical biometrics outperforms another. And it's becoming the most valuable input for AI-powered sports analytics, prediction models, and performance optimization systems.

### The Synthetic Data Threat

As training context becomes a premium asset for AI companies, teams, and betting platforms, a critical vulnerability emerges: **How do you prove the data comes from real humans?**

Today's ecosystem offers no guarantees:

- **Social media scraping**: AI companies harvest training videos from YouTube, TikTok, and Instagram — but get unverified, unstructured content with no authenticity guarantees
- **Deepfakes and synthetic content**: No way to distinguish real athlete footage from AI-generated or manipulated content
- **Bot-generated data**: Mass fake accounts could flood marketplaces with synthetic training data
- **Platform-owned silos**: Existing systems capture partial context but lock it in proprietary databases with no IP rights for athletes.

### The Stakes

AI models trained on fake or synthetic training data produce unreliable predictions. For teams making million-dollar roster decisions, betting platforms building prediction engines, and performance labs optimizing athlete development, **data authenticity is everything**.

The industry needs a cryptographic guarantee: _This training context data comes from real humans, not bots or AI-generated content._

---

## Why World ID is the Solution

World ID provides the missing authenticity layer for athlete-generated training context data.

### Zero-Knowledge Proof of Humanness

World ID enables athletes to prove they are unique humans without revealing their identity to Kinich's database. When an athlete verifies with World ID:

1. **Device-level verification**: World App (mobile) generates a zero-knowledge proof that the user is a unique human
2. **Cryptographic guarantee**: The proof is mathematically verifiable but reveals no personal information
3. **Nullifier hash**: A unique identifier prevents the same human from creating multiple verified accounts
4. **No documentation required**: Athletes don't submit government IDs, passports, or biometric databases to Kinich

### Minimal Data Collection

World ID verifies humanness cryptographically, so Kinich doesn't need to store passports, IDs, or KYC documents. The verification system is lightweight:

- **What Kinich stores**: `world_id_verified` (boolean), `nullifier_hash` (cryptographic identifier), `verified_at` (timestamp)
- **What Kinich never sees**: Athlete's real name, nationality, government ID, or World ID biometric data

This approach minimizes unnecessary data collection while providing robust Sybil resistance.

### Perfect Fit for Athlete-Owned IP

In Kinich's model, athletes own their training context as intellectual property registered on Story Protocol. World ID ensures that:

- **Authenticity = Value**: Verified human training data commands premium licensing fees from AI companies
- **Trust at scale**: Organizations licensing training datasets get cryptographic proof of data source authenticity
- **New data category**: "Verified human training context" becomes a distinct, high-value asset class

---

## Technical Implementation

## Key Components

1. **Frontend (IDKit Widget)**: React component that triggers World ID verification flow from athlete dashboard
2. **Backend API Route**: `/api/verify-world-id` handles proof verification and database updates
3. **Database Schema**: Stores verification state without storing personal information
4. **Access Control**: SQL function `has_audio_access()` checks World ID status to gate audio challenges
5. **Story Protocol Integration**: Verified assets get "human" badge metadata when registered as IP

### Frontend Integration: IDKit Widget

The World ID verification is triggered from the athlete dashboard using the `@worldcoin/idkit` widget:

```tsx
// src/components/custom/world-id-verify.tsx
import {
  IDKitWidget,
  VerificationLevel,
  ISuccessResult,
} from "@worldcoin/idkit";

export default function WorldIdVerify({
  athleteId,
  onVerificationSuccess,
}: Props) {
  const handleVerify = async (proof: ISuccessResult) => {
    // Send proof to backend for verification
    const response = await fetch("/api/verify-world-id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proof: {
          nullifier_hash: proof.nullifier_hash,
          merkle_root: proof.merkle_root,
          proof: proof.proof,
          verification_level: proof.verification_level,
        },
        athlete_id: athleteId,
      }),
    });

    if (!response.ok) {
      throw new Error("Verification failed");
    }
  };

  return (
    <IDKitWidget
      app_id={process.env.NEXT_PUBLIC_WORLD_ID_APP_ID as `app_${string}`}
      action='verify-athlete-profile'
      onSuccess={onVerificationSuccess}
      handleVerify={handleVerify}
      verification_level={VerificationLevel.Device}
    >
      {({ open }) => (
        <button onClick={open} className='primary-button'>
          Connect your World ID
        </button>
      )}
    </IDKitWidget>
  );
}
```

**Key Points:**

- `app_id`: Kinich's World ID application identifier
- `action`: Unique action string ("verify-athlete-profile") prevents proof reuse across different contexts
- `verification_level`: Device-level verification (alternatively can use Orb-level for higher assurance)
- `handleVerify`: Custom callback that sends proof to Kinich backend before success screen shows

### Backend Implementation: Proof Verification

The `/api/verify-world-id` route handles the critical verification logic:

```typescript
// src/app/api/verify-world-id/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { proof, athlete_id } = body;

  // 1. Check if athlete exists and is not already verified
  const supabase = await createClient();
  const { data: athlete } = await supabase
    .from("athletes")
    .select("id, world_id_verified, world_id_nullifier_hash")
    .eq("id", athlete_id)
    .single();

  if (athlete.world_id_verified) {
    return NextResponse.json(
      { error: "Athlete is already verified with World ID" },
      { status: 400 }
    );
  }

  // 2. Check if this nullifier_hash is already used (Sybil resistance)
  const { data: existingVerification } = await supabase
    .from("athletes")
    .select("id")
    .eq("world_id_nullifier_hash", proof.nullifier_hash)
    .single();

  if (existingVerification && existingVerification.id !== athlete_id) {
    return NextResponse.json(
      {
        error:
          "This World ID has already been used to verify another athlete profile",
      },
      { status: 400 }
    );
  }

  // 3. Verify the proof with World ID Developer Portal API
  const verifyResponse = await fetch(
    `https://developer.worldcoin.org/api/v2/verify/${process.env.WORLD_ID_APP_ID}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nullifier_hash: proof.nullifier_hash,
        merkle_root: proof.merkle_root,
        proof: proof.proof,
        verification_level: proof.verification_level,
        action: process.env.WORLD_ID_ACTION, // "verify-athlete-profile"
      }),
    }
  );

  const verifyData = await verifyResponse.json();

  if (!verifyResponse.ok || !verifyData.success) {
    console.error("World ID verification failed:", verifyData);
    return NextResponse.json(
      { error: "World ID verification failed", details: verifyData },
      { status: 400 }
    );
  }

  // 4. Verification succeeded - update the database
  const { error: updateError } = await supabase
    .from("athletes")
    .update({
      world_id_verified: true,
      world_id_nullifier_hash: proof.nullifier_hash,
      world_id_verified_at: new Date().toISOString(),
    })
    .eq("id", athlete_id);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to save verification to database" },
      { status: 500 }
    );
  }

  // 5. Update profile score after World ID verification
  await recalculateAthleteScoreSafe(athlete_id);

  return NextResponse.json({
    success: true,
    message: "Athlete profile verified successfully",
    nullifier_hash: proof.nullifier_hash,
    verified_at: new Date().toISOString(),
  });
}
```

**Critical Security Measures:**

1. **Duplicate Prevention**: Check if `nullifier_hash` already exists in database before accepting verification
2. **Proof Verification**: Always verify proof with World ID's API — never trust client-side verification alone
3. **Action Binding**: The `action` parameter prevents proof reuse from other contexts
4. **Error Handling**: If verification succeeds but database update fails, log the issue for manual intervention

**Why `nullifier_hash` is Critical:**

The `nullifier_hash` is a deterministic cryptographic identifier derived from the user's World ID and the `action` parameter. Key properties:

- **Unique per human**: Same human → same nullifier_hash (for a given action)
- **Anonymous**: Reveals nothing about the user's identity
- **Sybil-resistant**: Kinich can check if a nullifier_hash is already used without knowing who the human is
- **Action-bound**: Different actions generate different nullifier_hashes for the same human

This enables one-human-one-verification enforcement without collecting personal information.

## Real-World Impact: Training Context Meets Trust

### For Athletes

- **Audio Challenges Unlocked**: World ID verification grants access to record mental pattern capsules (identity capsules, decision logic, focus states)
- **Verified Badge**: "human" badge appears on athlete profile and all assets, increasing IP asset value
- **Profile Score Boost**: 15 points added to gamified profile scoring system
- **Premium Positioning**: Verified human training data commands higher licensing fees from organizations

### For AI Companies & Data Buyers

- **Guaranteed Human-Source Data**: Cryptographic proof that training context comes from real athletes, not bots or synthetic content
- **Sybil Resistance**: One human = one verification prevents mass fake accounts flooding the marketplace
- **Data Quality Assurance**: World ID verification becomes a filter for premium training datasets
- **Reduced Legal Risk**: Clear provenance and authenticity guarantees for AI training data

### For Teams & Researchers

- **Trust at Scale**: Licensing training context data with confidence that it originates from real athletes
- **Authentic Training Protocols**: Mental pattern capsules and drill execution data verified as human-generated
- **Performance Modeling**: AI models trained on verified human data produce reliable predictions for roster decisions, injury prevention, and talent development

### For the Ecosystem

- **Scalable Human Verification**: World ID enables verification without requiring athletes to submit government IDs, passports, or biometric databases
- **New Data Category**: "Verified human training context" emerges as a distinct, high-value asset class
- **Blockchain-Native**: Verification status flows through Story Protocol IP registration, creating authenticated on-chain provenance

## For the sports data economy moving toward training context as the next frontier, World ID provides the cryptographic foundation that makes athlete-owned IP trustworthy, valuable, and ready for the AI era.

**Technical Summary:**

- **Frontend**: IDKit widget (`@worldcoin/idkit`) triggers verification flow
- **Backend**: `/api/verify-world-id` route verifies proof with World ID Developer Portal API
- **Database**: PostgreSQL stores `world_id_verified`, `nullifier_hash`, and verification timestamp
- **Access Control**: SQL function gates audio challenges based on World ID status
- **Integration Points**: Athlete dashboard (verification CTA), asset pages ("human" badge display), Story Protocol metadata

**World ID Usage:**

- **Verification Level**: Device (with option for Orb-level)
- **Action**: `verify-athlete-profile`
- **App ID**: Configured via environment variable
- **Proof Components**: `nullifier_hash`, `merkle_root`, `proof`, `verification_level`
