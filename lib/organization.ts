import { supabase } from "@/lib/supabase";

export type Organization = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type OrganizationMembership = {
  organization_id: string;
  user_id: string;
  role: string;
  created_at: string;
  organization?: Organization;
};

/**
 * Get all organizations available to the currently authenticated user.
 *
 * The actual security boundary remains Supabase RLS.
 * This helper only discovers the organizations the current user belongs to.
 */
export async function getUserOrganizations(): Promise<
  OrganizationMembership[]
> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  if (!user) {
    throw new Error("User is not authenticated.");
  }

  const { data, error } = await supabase
    .from("organization_members")
    .select(
      `
        organization_id,
        user_id,
        role,
        created_at,
        organizations (
          id,
          name,
          slug,
          created_at
        )
      `
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: true,
    });

  if (error) {
    console.error("GET USER ORGANIZATIONS ERROR:", error);
    throw new Error(error.message);
  }

  return (data ?? []).map((membership) => ({
    organization_id: membership.organization_id,
    user_id: membership.user_id,
    role: membership.role,
    created_at: membership.created_at,
    organization: Array.isArray(membership.organizations)
      ? membership.organizations[0]
      : membership.organizations ?? undefined,
  }));
}

/**
 * Get the primary organization for the current user.
 *
 * For the current LedgerFlow MVP, users have one primary organization.
 * The function is written so multiple organizations can be supported later.
 */
export async function getCurrentOrganization(): Promise<Organization> {
  const organizations = await getUserOrganizations();

  if (organizations.length === 0) {
    throw new Error(
      "No organization found for the current user."
    );
  }

  const organization = organizations[0].organization;

  if (!organization) {
    throw new Error(
      "Organization information could not be loaded."
    );
  }

  return organization;
}

/**
 * Get the current user's membership in their primary organization.
 */
export async function getCurrentOrganizationMembership(): Promise<
  OrganizationMembership
> {
  const organizations = await getUserOrganizations();

  if (organizations.length === 0) {
    throw new Error(
      "No organization membership found for the current user."
    );
  }

  return organizations[0];
}

/**
 * Get the current organization ID.
 *
 * This is the helper that application features should use
 * whenever they need to associate a new client/document/etc.
 */
export async function getCurrentOrganizationId(): Promise<string> {
  const organization = await getCurrentOrganization();

  return organization.id;
}