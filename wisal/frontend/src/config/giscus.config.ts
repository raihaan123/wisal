/**
 * Giscus Configuration for Wisal Forum
 * 
 * To set up Giscus for your GitHub repository:
 * 
 * 1. Go to https://giscus.app/
 * 2. Enter your GitHub repository details
 * 3. Enable GitHub Discussions in your repository settings
 * 4. Configure the following options:
 *    - Repository: your-github-username/your-repo-name
 *    - Page ↔️ Discussion Mapping: pathname
 *    - Discussion Category: General
 *    - Features: Enable reactions, emit metadata
 *    - Theme: light
 * 5. Copy the generated configuration values below
 */

export const giscusConfig = {
  // Replace these with your actual values from https://giscus.app/
  // TEMPORARILY DISABLED - Set enabled to false until GitHub repo is configured
  enabled: false,
  repo: 'your-github-username/your-repo-name' as const, // e.g., 'user/wisal-forum'
  repoId: 'your-repo-id', // e.g., 'R_kgDOKxxx'
  category: 'General',
  categoryId: 'your-category-id', // e.g., 'DIC_kwDOKxxx'
  
  // These settings can remain as default
  mapping: 'pathname' as const,
  strict: '0' as const,
  reactionsEnabled: '1' as const,
  emitMetadata: '1' as const,
  inputPosition: 'top' as const,
  theme: 'light' as const,
  lang: 'en' as const,
  loading: 'lazy' as const,
}

// Forum categories configuration
export const forumCategories = {
  general: {
    name: 'General Discussion',
    category: 'General',
    categoryId: 'your-general-category-id',
  },
  legal: {
    name: 'Legal Advice',
    category: 'Legal Advice',
    categoryId: 'your-legal-category-id',
  },
  activism: {
    name: 'Activism',
    category: 'Activism',
    categoryId: 'your-activism-category-id',
  },
}

/**
 * Instructions for setting up GitHub Discussions categories:
 * 
 * 1. Go to your repository's Settings → Features → Enable Discussions
 * 2. Navigate to the Discussions tab in your repository
 * 3. Click on the categories settings (⚙️ icon)
 * 4. Create the following categories:
 *    - General (for general discussions)
 *    - Legal Advice (for legal questions)
 *    - Activism (for activism-related topics)
 * 5. Update the categoryId values above with the actual IDs
 */