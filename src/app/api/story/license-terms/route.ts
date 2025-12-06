import { NextRequest, NextResponse } from "next/server";

const STORY_API_BASE_URL =
  process.env.STORY_API_BASE_URL || "https://staging-api.storyprotocol.net";
const STORY_API_KEY = process.env.STORY_API_KEY;

if (!STORY_API_KEY) {
  console.error(
    "[Story API] STORY_API_KEY environment variable is not set. License terms will not be available."
  );
}

interface LicenseTerms {
  commercialUse: boolean;
  derivativesAllowed: boolean;
  commercialRevShare: number;
  commercialAttribution: boolean;
  uri: string;
}

interface StoryLicense {
  createdAt: string;
  licenseTemplateId: string;
  licenseTermsId: string;
  licensingConfig: {
    commercialRevShare: number;
    disabled: boolean;
    expectGroupRewardPool: string;
    expectMinimumGroupRewardShare: number;
    hookData: string;
    isSet: boolean;
    licensingHook: string;
    mintingFee: string;
  };
  templateMetadataUri: string;
  templateName: string;
  terms: LicenseTerms;
  updatedAt: string;
}

interface StoryIPAsset {
  ipId: string;
  licenses: StoryLicense[];
  // ... other fields we don't need
}

interface StoryAPIResponse {
  data: StoryIPAsset[];
  pagination: {
    hasMore: boolean;
    limit: number;
    offset: number;
    total: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ipId = searchParams.get("ipId");

    if (!ipId) {
      return NextResponse.json(
        { error: "Missing ipId parameter" },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!STORY_API_KEY) {
      console.error(
        "[Story API] STORY_API_KEY is not configured. Cannot fetch license terms."
      );
      return NextResponse.json(
        { error: "Story Protocol API is not configured" },
        { status: 503 }
      );
    }

    // Make POST request to Story Protocol API
    const response = await fetch(`${STORY_API_BASE_URL}/api/v4/assets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": STORY_API_KEY,
      },
      body: JSON.stringify({
        includeLicenses: true,
        where: {
          ipIds: [ipId],
        },
        pagination: {
          limit: 1,
          offset: 0,
        },
      }),
    });

    if (!response.ok) {
      console.error(
        `[Story API] Request failed: ${response.status} ${response.statusText}`
      );
      return NextResponse.json(
        { error: "Failed to fetch license terms from Story Protocol" },
        { status: 500 }
      );
    }

    const data: StoryAPIResponse = await response.json();

    if (!data.data || data.data.length === 0) {
      console.log(`[Story API] IP asset not found: ${ipId}`);
      return NextResponse.json(
        { error: "IP asset not found" },
        { status: 404 }
      );
    }

    const ipAsset = data.data[0];

    // Check if licenses exist
    if (!ipAsset.licenses || ipAsset.licenses.length === 0) {
      return NextResponse.json(
        { error: "No license terms attached to this IP asset" },
        { status: 404 }
      );
    }

    // Return the first license terms
    const firstLicense = ipAsset.licenses[0];

    return NextResponse.json({
      terms: firstLicense.terms,
      templateName: firstLicense.templateName,
      licenseTermsId: firstLicense.licenseTermsId,
    });
  } catch (error) {
    console.error("[Story API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
