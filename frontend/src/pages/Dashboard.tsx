import React from 'react';
import { BrowserProvider } from 'ethers';
import PageLayout from '../components/PageLayout';
import PageTitle from '../components/PageTitle';
import ContentSection from '../components/ContentSection';
import StatCard from '../components/StatCard';
import ActionCard from '../components/ActionCard';
import DashboardGrid from '../components/DashboardGrid';
import { Leaf, TrendingUp, Award, Zap, Activity, Users, Target, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardProps {
  provider: BrowserProvider | null;
  address: string;
}

export default function Dashboard({ provider, address }: DashboardProps) {
  // Mock data - in real implementation, this would come from blockchain
  const stats = {
    balance: '1,234.56',
    actions: 42,
    verified: 38,
    co2Offset: 156.7
  };

  const quickActions = [
    {
      icon: '🌱',
      title: 'Submit Action',
      description: 'Share your latest eco-action',
      onClick: () => window.location.hash = '#/submit'
    },
    {
      icon: '📋',
      title: 'View Actions',
      description: 'Track your history',
      onClick: () => window.location.hash = '#/actions'
    },
    {
      icon: '💚',
      title: 'Make Donation',
      description: 'Support environmental causes',
      onClick: () => window.location.hash = '#/donate'
    },
    {
      icon: '🏆',
      title: 'Leaderboard',
      description: 'See top contributors',
      onClick: () => window.location.hash = '#/leaderboard'
    }
  ];

  return (
    <PageLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <PageTitle
          title="Green Credits Dashboard"
          subtitle="🌿 Track your environmental impact and token growth"
          icon={<Leaf className="w-16 h-16 text-green-400" />}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <ContentSection
          title="Impact Overview"
          description="Your environmental contributions and rewards"
        >
          <DashboardGrid>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <StatCard
                icon={<Leaf className="w-8 h-8" />}
                value={stats.balance}
                label="GCT Balance"
                change="+12.5%"
                changeType="positive"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <StatCard
                icon={<Activity className="w-8 h-8" />}
                value={stats.actions}
                label="Total Actions"
                change="+3"
                changeType="positive"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <StatCard
                icon={<Award className="w-8 h-8" />}
                value={stats.verified}
                label="Verified Actions"
                change="+2"
                changeType="positive"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
            >
              <StatCard
                icon={<Target className="w-8 h-8" />}
                value={`${stats.co2Offset}kg`}
                label="CO₂ Offset"
                change="-0.8%"
                changeType="positive"
              />
            </motion.div>
          </DashboardGrid>
        </ContentSection>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <ContentSection
          title="Quick Actions"
          description="Jump into your favorite activities"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
              >
                <ActionCard
                  icon={action.icon}
                  title={action.title}
                  description={action.description}
                  onClick={action.onClick}
                />
              </motion.div>
            ))}
          </div>
        </ContentSection>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        <ContentSection
          title="Recent Activity"
          description="Your latest environmental contributions"
        >
          <div className="space-y-4">
            {[1, 2, 3].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.0 + index * 0.1 }}
                className="card p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center"
                    >
                      <Leaf className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </motion.div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Recycled Electronics
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Verified 2 days ago • +25 GCT
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">
                      +25 GCT
                    </div>
                    <div className="text-xs text-gray-500">
                      2 days ago
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ContentSection>
      </motion.div>
    </PageLayout>
  );
}
