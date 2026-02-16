import { useState } from 'react'
import { typeIconMap, FileType } from '../../utils/typeIcon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface TreeNode {
    name: string;
    type: FileType;
    children?: TreeNode[];
}

const TreeItem = ({ node, depth }: { node: TreeNode, depth: number }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Determine icon and color
    let iconData = typeIconMap.file;
    if (node.type === 'folder') {
        iconData = typeIconMap.folder;
    } else {
        const extension = node.name.split('.').pop();
        if (extension && extension in typeIconMap) {
            iconData = typeIconMap[extension as keyof typeof typeIconMap];
        }
    }

    const handleToggle = () => {
        if (node.type === 'folder') {
            setIsOpen(!isOpen);
        }
    };

    return (
        <div className="tree-node">
            <div 
                className="tree-item" 
                style={{ paddingLeft: `${depth * 10 + 5}px` }}
                onClick={handleToggle}
            >
                {node.type === 'folder' && (
                    <span className="arrow-icon">
                        <FontAwesomeIcon icon={isOpen ? faChevronDown : faChevronRight} size="xs" />
                    </span>
                )}
                {node.type !== 'folder' && <span className="spacer" />}
                
                <span 
                    className={`file-icon ${node.type}`}
                    style={{ color: iconData.color }}
                >
                    <FontAwesomeIcon icon={iconData.icon} />
                </span>
                <span className="node-name">{node.name}</span>
            </div>
            
            {isOpen && node.children && (
                <div className="tree-children">
                    {node.children.map((child, index) => (
                        <TreeItem key={index} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function ExplorerTree() {
    const tree: TreeNode[] = [
  {
    name: 'saas-analytics-platform',
    type: 'folder',
    children: [
      // ────────────────────────────────────────────────
      //                  ROOT LEVEL
      // ────────────────────────────────────────────────
      { name: '.env',                        type: 'file' },
      { name: '.env.local',                  type: 'file' },
      { name: '.env.example',                type: 'file' },
      { name: '.eslintrc.cjs',               type: 'file' },
      { name: '.gitignore',                  type: 'file' },
      { name: '.prettierrc',                 type: 'file' },
      { name: 'index.html',                  type: 'html' },
      { name: 'package.json',                type: 'file' },
      { name: 'pnpm-lock.yaml',              type: 'file' },
      { name: 'README.md',                   type: 'file' },
      { name: 'tsconfig.json',               type: 'file' },
      { name: 'tsconfig.node.json',          type: 'file' },
      { name: 'vite.config.ts',              type: 'ts' },
      { name: 'tailwind.config.ts',          type: 'ts' },
      { name: 'postcss.config.js',           type: 'js' },

      // ────────────────────────────────────────────────
      //                     public/
      // ────────────────────────────────────────────────
      {
        name: 'public',
        type: 'folder',
        children: [
          { name: 'favicon.ico',               type: 'ico' },
          { name: 'apple-touch-icon.png',      type: 'png' },
          { name: 'manifest.json',             type: 'file' },
          { name: 'robots.txt',                type: 'file' },
          {
            name: 'assets',
            type: 'folder',
            children: [
              { name: 'logo.svg',              type: 'svg' },
              { name: 'logo-dark.svg',         type: 'svg' },
              { name: 'og-image.jpg',          type: 'jpg' },
              { name: 'og-image-wide.png',     type: 'png' },
              { name: 'placeholder-avatar.png',type: 'png' }
            ]
          }
        ]
      },

      // ────────────────────────────────────────────────
      //                       src/
      // ────────────────────────────────────────────────
      {
        name: 'src',
        type: 'folder',
        children: [

          // ─── assets/ ──────────────────────────────────
          {
            name: 'assets',
            type: 'folder',
            children: [
              {
                name: 'icons',
                type: 'folder',
                children: [
                  { name: 'activity.svg',      type: 'svg' },
                  { name: 'arrow-right.svg',   type: 'svg' },
                  { name: 'bar-chart.svg',     type: 'svg' },
                  { name: 'bell.svg',          type: 'svg' },
                  { name: 'calendar.svg',      type: 'svg' },
                  { name: 'chart-pie.svg',     type: 'svg' },
                  { name: 'chevron-down.svg',  type: 'svg' },
                  { name: 'download.svg',      type: 'svg' },
                  { name: 'users.svg',         type: 'svg' }
                ]
              },
              { name: 'illustrations', type: 'folder', children: [
                { name: 'empty-analytics.svg', type: 'svg' },
                { name: 'no-data-dark.svg',    type: 'svg' },
                { name: 'success-check.svg',   type: 'svg' }
              ]}
            ]
          },

          // ─── components/ ──────────────────────────────
          {
            name: 'components',
            type: 'folder',
            children: [
              {
                name: 'ui',
                type: 'folder',
                children: [
                  { name: 'Avatar.tsx',              type: 'tsx' },
                  { name: 'Badge.tsx',               type: 'tsx' },
                  { name: 'Button.tsx',              type: 'tsx' },
                  { name: 'Card.tsx',                type: 'tsx' },
                  { name: 'DataTable.tsx',           type: 'tsx' },
                  { name: 'Dialog.tsx',              type: 'tsx' },
                  { name: 'DropdownMenu.tsx',        type: 'tsx' },
                  { name: 'Input.tsx',               type: 'tsx' },
                  { name: 'Label.tsx',               type: 'tsx' },
                  { name: 'Skeleton.tsx',            type: 'tsx' },
                  { name: 'Switch.tsx',              type: 'tsx' },
                  { name: 'Tabs.tsx',                type: 'tsx' },
                  { name: 'Tooltip.tsx',             type: 'tsx' }
                ]
              },
              {
                name: 'layout',
                type: 'folder',
                children: [
                  { name: 'AppShell.tsx',            type: 'tsx' },
                  { name: 'DashboardHeader.tsx',     type: 'tsx' },
                  { name: 'MobileNav.tsx',           type: 'tsx' },
                  { name: 'Sidebar.tsx',             type: 'tsx' },
                  { name: 'SidebarNavItem.tsx',      type: 'tsx' },
                  { name: 'Topbar.tsx',              type: 'tsx' }
                ]
              },
              {
                name: 'dashboard',
                type: 'folder',
                children: [
                  { name: 'KpiCard.tsx',             type: 'tsx' },
                  { name: 'MetricCard.tsx',          type: 'tsx' },
                  { name: 'RevenueChart.tsx',        type: 'tsx' },
                  { name: 'UserGrowthChart.tsx',     type: 'tsx' },
                  { name: 'RecentSignups.tsx',       type: 'tsx' },
                  { name: 'TopCountriesMap.tsx',     type: 'tsx' }
                ]
              }
            ]
          },

          // ─── features / domain folders ────────────────
          {
            name: 'features',
            type: 'folder',
            children: [
              {
                name: 'analytics',
                type: 'folder',
                children: [
                  { name: 'AnalyticsPage.tsx',       type: 'tsx' },
                  { name: 'useAnalyticsQuery.ts',    type: 'ts' },
                  { name: 'types.ts',                type: 'ts' }
                ]
              },
              {
                name: 'auth',
                type: 'folder',
                children: [
                  { name: 'LoginPage.tsx',           type: 'tsx' },
                  { name: 'RegisterPage.tsx',        type: 'tsx' },
                  { name: 'ForgotPassword.tsx',      type: 'tsx' },
                  { name: 'useAuth.ts',              type: 'ts' },
                  { name: 'authService.ts',          type: 'ts' }
                ]
              },
              {
                name: 'settings',
                type: 'folder',
                children: [
                  { name: 'ProfilePage.tsx',         type: 'tsx' },
                  { name: 'TeamPage.tsx',            type: 'tsx' },
                  { name: 'BillingPage.tsx',         type: 'tsx' },
                  { name: 'NotificationSettings.tsx',type: 'tsx' },
                  { name: 'Appearance.tsx',          type: 'tsx' }
                ]
              },
              {
                name: 'users',
                type: 'folder',
                children: [
                  { name: 'UsersListPage.tsx',       type: 'tsx' },
                  { name: 'UserDetailPage.tsx',      type: 'tsx' },
                  { name: 'UserForm.tsx',            type: 'tsx' }
                ]
              }
            ]
          },

          // ─── hooks, lib, store, styles, types ─────────
          { name: 'hooks', type: 'folder', children: [
            { name: 'useDebounce.ts',            type: 'ts' },
            { name: 'useLocalStorage.ts',        type: 'ts' },
            { name: 'useMediaQuery.ts',          type: 'ts' },
            { name: 'useMounted.ts',             type: 'ts' }
          ]},
          { name: 'lib', type: 'folder', children: [
            { name: 'api.ts',                    type: 'ts' },
            { name: 'axios.ts',                  type: 'ts' },
            { name: 'date.ts',                   type: 'ts' },
            { name: 'formatNumber.ts',           type: 'ts' }
          ]},
          {
            name: 'store',
            type: 'folder',
            children: [
              { name: 'index.ts',                type: 'ts' },
              { name: 'authStore.ts',            type: 'ts' },
              { name: 'themeStore.ts',           type: 'ts' },
              { name: 'uiStore.ts',              type: 'ts' }
            ]
          },
          {
            name: 'styles',
            type: 'folder',
            children: [
              { name: 'globals.css',             type: 'css' },
              { name: 'variables.css',           type: 'css' },
              { name: 'themes', type: 'folder', children: [
                { name: 'dark.css',              type: 'css' },
                { name: 'light.css',             type: 'css' }
              ]}
            ]
          },
          { name: 'types', type: 'folder', children: [
            { name: 'index.d.ts',                type: 'ts' },
            { name: 'api.d.ts',                  type: 'ts' },
            { name: 'user.d.ts',                 type: 'ts' }
          ]},

          // ─── entry points ─────────────────────────────
          { name: 'App.tsx',                     type: 'tsx' },
          { name: 'main.tsx',                    type: 'tsx' },
          { name: 'router.tsx',                  type: 'tsx' },
          { name: 'routes.tsx',                  type: 'tsx' },
          { name: 'vite-env.d.ts',               type: 'ts' }
        ]
      },

      // ────────────────────────────────────────────────
      //                tests / e2e
      // ────────────────────────────────────────────────
      {
        name: 'tests',
        type: 'folder',
        children: [
          { name: 'setup.ts',                    type: 'ts' },
          {
            name: 'e2e',
            type: 'folder',
            children: [
              { name: 'login.spec.ts',           type: 'ts' },
              { name: 'dashboard.spec.ts',       type: 'ts' }
            ]
          },
          {
            name: 'unit',
            type: 'folder',
            children: [
              { name: 'components', type: 'folder', children: [
                { name: 'Button.test.tsx',       type: 'tsx' },
                { name: 'KpiCard.test.tsx',      type: 'tsx' }
              ]}
            ]
          }
        ]
      },

      // ────────────────────────────────────────────────
      //           Storybook / design system
      // ────────────────────────────────────────────────
      {
        name: '.storybook',
        type: 'folder',
        children: [
          { name: 'main.ts',                     type: 'ts' },
          { name: 'preview.ts',                  type: 'ts' },
          { name: 'manager.ts',                  type: 'ts' }
        ]
      },
      { name: 'stories', type: 'folder', children: [
        { name: 'Button.stories.tsx',          type: 'tsx' },
        { name: 'Card.stories.tsx',            type: 'tsx' },
        { name: 'KpiCard.stories.tsx', type: 'tsx' }
      ]}
    ]
  }
];

  return (
    <div className="explorer_tree">
        {tree.map((node, index) => (
            <TreeItem key={index} node={node} depth={0} />
        ))}
    </div>
  )
}
