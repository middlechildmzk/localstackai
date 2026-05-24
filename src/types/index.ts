// ─── Enums ───────────────────────────────────────────────────────────────────
export type FreshnessStatus = "verified" | "fresh" | "stale" | "unverified";
export type ToolRelationshipType =
  | "alternative"
  | "complement"
  | "replaces"
  | "integrates_with"
  | "used_with";
export type DataFlowType =
  | "native_api"
  | "webhook"
  | "zapier"
  | "make"
  | "manual_export"
  | "unknown";
export type SubmissionStatus = "pending" | "approved" | "rejected" | "duplicate";
export type ClaimStatus = "pending" | "approved" | "rejected";
export type PricingModel =
  | "free"
  | "freemium"
  | "paid"
  | "subscription"
  | "usage_based"
  | "enterprise"
  | "open_source";
export type StackVisibility = "public" | "private" | "unlisted";
export type AnalyticsEventType =
  | "tool_view"
  | "search"
  | "save"
  | "stack_create"
  | "stack_fork"
  | "compare_click"
  | "outbound_click"
  | "submit_tool"
  | "claim_tool"
  | "newsletter_signup"
  | "stack_view"
  | "workflow_view";

// ─── Core Models ─────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  website: string | null;
  is_admin: boolean;
  is_maker: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sort_order: number;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Tool {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
  affiliate_url: string | null;
  pricing_model: PricingModel;
  has_free_plan: boolean;
  starting_price: number | null;
  pricing_notes: string | null;
  best_for: string[] | null;
  not_ideal_for: string[] | null;
  freshness: FreshnessStatus;
  last_verified_at: string | null;
  is_sponsored: boolean;
  is_claimed: boolean;
  claimed_by: string | null;
  is_featured: boolean;
  is_published: boolean;
  tool_score: number;
  view_count: number;
  save_count: number;
  stack_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
  // joins
  categories?: Category[];
  tags?: Tag[];
  tool_relationships?: ToolRelationship[];
  trending?: TrendingScore;
}

export interface ToolWithRelations extends Tool {
  categories: Category[];
  tags: Tag[];
  alternatives?: Tool[];
}

export interface ToolRelationship {
  id: string;
  source_tool_id: string;
  target_tool_id: string;
  relationship_type: ToolRelationshipType;
  workflow_context: string | null;
  confidence: number;
  source: string;
  created_at: string;
  // joins
  source_tool?: Tool;
  target_tool?: Tool;
}

export interface Workflow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  outcome: string | null;
  target_role: string | null;
  hero_image: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  view_count: number;
  save_count: number;
  created_at: string;
  updated_at: string;
  // joins
  steps?: WorkflowStep[];
  tools?: WorkflowTool[];
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_number: number;
  title: string;
  description: string | null;
  created_at: string;
}

export interface WorkflowTool {
  id: string;
  workflow_id: string;
  step_id: string | null;
  tool_id: string;
  tier: "budget" | "recommended" | "pro";
  notes: string | null;
  sort_order: number;
  tool?: Tool;
}

export interface Stack {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  owner_id: string | null;
  workflow_id: string | null;
  forked_from_id: string | null;
  visibility: StackVisibility;
  is_featured: boolean;
  monthly_cost: number | null;
  view_count: number;
  fork_count: number;
  save_count: number;
  created_at: string;
  updated_at: string;
  // joins
  owner?: Profile;
  stack_tools?: StackTool[];
  workflow?: Workflow;
}

export interface StackTool {
  id: string;
  stack_id: string;
  tool_id: string;
  role_in_stack: string | null;
  step_order: number;
  substitute_group: string | null;
  monthly_cost: number | null;
  data_flow_type: DataFlowType;
  notes: string | null;
  created_at: string;
  tool?: Tool;
}

export interface Submission {
  id: string;
  submitted_by: string | null;
  submitter_email: string;
  tool_name: string;
  tool_url: string;
  tagline: string | null;
  description: string | null;
  pricing_notes: string | null;
  category_ids: string[] | null;
  status: SubmissionStatus;
  reviewer_id: string | null;
  review_notes: string | null;
  resulting_tool: string | null;
  created_at: string;
  updated_at: string;
}

export interface Claim {
  id: string;
  tool_id: string;
  claimed_by: string;
  claimant_email: string;
  proof_url: string | null;
  notes: string | null;
  status: ClaimStatus;
  reviewer_id: string | null;
  review_notes: string | null;
  created_at: string;
  updated_at: string;
  tool?: Tool;
  claimant?: Profile;
}

export interface FreshnessEvent {
  id: string;
  tool_id: string;
  event_type: string;
  old_value: string | null;
  new_value: string | null;
  source: string;
  created_by: string | null;
  created_at: string;
  tool?: Tool;
}

export interface SourceCheck {
  id: string;
  tool_id: string;
  check_type: "link" | "pricing" | "changelog" | "general";
  source_url: string | null;
  status: "pending" | "ok" | "broken" | "changed" | "error";
  notes: string | null;
  checked_at: string | null;
  created_at: string;
  tool?: Tool;
}

export interface TrendingScore {
  tool_id: string;
  saves_7d: number;
  clicks_7d: number;
  stack_adds_7d: number;
  trending_score: number;
  computed_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  source: string | null;
  interests: string[] | null;
  is_active: boolean;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: AnalyticsEventType;
  entity_id: string | null;
  entity_type: string | null;
  user_id: string | null;
  session_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ─── API Response Helpers ─────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  error: string;
  status: number;
}
