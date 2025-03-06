"use client";

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { AlertCircle, Clock, Database, GitBranch, MessageSquare } from 'lucide-react';

const problems = [
  {
    icon: AlertCircle,
    title: "Lost Deals Slipping Through the Cracks",
    description: "Important opportunities get buried in complex systems, leading to missed revenue."
  },
  {
    icon: Clock,
    title: "Time Wasted on Manual Tasks",
    description: "Hours spent on data entry and repetitive work instead of closing deals."
  },
  {
    icon: Database,
    title: "Scattered Customer Data",
    description: "Critical information spread across multiple tools, making it hard to track progress."
  },
  {
    icon: GitBranch,
    title: "Complicated Pipeline Management",
    description: "Confusing sales processes that make it difficult to prioritize leads."
  },
  {
    icon: MessageSquare,
    title: "Missed Follow-ups",
    description: "Important conversations falling through the cracks due to poor tracking."
  }
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export function ProblemSection() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          ref={ref}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Tired of Complex CRMs That Waste Your Time?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sales teams are struggling with overcomplicated tools that create more problems than they solve.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-background rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <problem.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{problem.title}</h3>
                  <p className="text-sm text-muted-foreground">{problem.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}