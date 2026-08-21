import 'reflect-metadata';
import 'dotenv/config';
import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UserSchema } from './auth/schemas/user.schema';
import { ProjectSchema } from './projects/schemas/project.schema';
import { TaskSchema } from './tasks/schemas/task.schema';
import { TeamSchema } from './teams/schemas/team.schema';

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is missing');

  await mongoose.connect(uri);
  const User = mongoose.model('User', UserSchema);
  const Project = mongoose.model('Project', ProjectSchema);
  const Task = mongoose.model('Task', TaskSchema);
  const Team = mongoose.model('Team', TeamSchema);

  let user = await User.findOne({ email: 'demo@ablespace.dev' });
  if (!user) {
    user = await User.create({
      name: 'Demo User',
      email: 'demo@ablespace.dev',
      passwordHash: await bcrypt.hash('Demo@12345', 12),
      title: 'Product Designer',
      role: 'admin',
    });
  }

  await Project.deleteMany({});
  await Team.deleteMany({});
  await Task.deleteMany({});

  const team = await Team.create({ name: 'Product Team', description: 'Core AbleSpace product team', lead: user._id, members: [user._id] });
  const project = await Project.create({
    name: 'AbleSpace Launch',
    description: 'Prepare the product for the public launch.',
    priority: 'high',
    status: 'active',
    lead: user._id,
    members: [user._id],
  });

  await Task.insertMany([
    { title: 'Design dashboard experience', description: 'Finalize the dashboard information hierarchy.', status: 'doing', priority: 'high', assignee: user._id, reporter: user._id, project: project._id, team: team._id, labels: ['design', 'dashboard'] },
    { title: 'Prepare launch checklist', description: 'Create the final launch checklist.', status: 'todo', priority: 'medium', assignee: user._id, reporter: user._id, project: project._id, team: team._id, labels: ['launch'] },
    { title: 'Review API integration', description: 'Validate frontend and backend integration.', status: 'completed', priority: 'medium', assignee: user._id, reporter: user._id, project: project._id, team: team._id, labels: ['backend'] },
    { title: 'Wait for final assets', description: 'Hold until final marketing assets arrive.', status: 'on-hold', priority: 'low', assignee: user._id, reporter: user._id, project: project._id, team: team._id, labels: ['assets'] },
  ]);

  console.log('AbleSpace demo data seeded.');
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
