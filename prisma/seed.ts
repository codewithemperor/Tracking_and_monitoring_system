import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nipost.gov.ng' },
    update: {},
    create: {
      email: 'admin@nipost.gov.ng',
      passwordHash: adminPassword,
      name: 'System Administrator',
      phone: '+2348000000001',
      role: 'ADMIN',
    },
  });

  // Create staff user
  const staffPassword = await bcrypt.hash('staff123', 12);
  const staff = await prisma.user.upsert({
    where: { email: 'staff@nipost.gov.ng' },
    update: {},
    create: {
      email: 'staff@nipost.gov.ng',
      passwordHash: staffPassword,
      name: 'John Doe',
      phone: '+2348000000002',
      role: 'STAFF',
    },
  });

  // Create sample customer user
  const customerPassword = await bcrypt.hash('customer123', 12);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      passwordHash: customerPassword,
      name: 'Jane Smith',
      phone: '+2348000000003',
      role: 'CUSTOMER',
    },
  });

  // Create sample parcels
  const parcel1 = await prisma.parcel.create({
    data: {
      trackingId: 'NIP2024001',
      userId: customer.id,
      staffId: staff.id,
      status: 'IN_TRANSIT',
      origin: 'Lagos',
      destination: 'Abuja',
      currentLocation: 'Enugu Route',
      weight: 2.5,
      dimensions: '30x20x15',
      description: 'Important documents',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  const parcel2 = await prisma.parcel.create({
    data: {
      trackingId: 'NIP2024002',
      userId: customer.id,
      staffId: staff.id,
      status: 'PENDING',
      origin: 'Abuja',
      destination: 'Lagos',
      currentLocation: 'Abuja Office',
      weight: 1.8,
      dimensions: '25x15x10',
      description: 'Electronics package',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  // Create status history for parcels
  await prisma.statusHistory.createMany({
    data: [
      {
        parcelId: parcel1.id,
        status: 'PENDING',
        location: 'Lagos Office',
        description: 'Parcel received and pending processing',
        updatedBy: staff.id,
      },
      {
        parcelId: parcel1.id,
        status: 'DISPATCHED',
        location: 'Lagos Office',
        description: 'Parcel dispatched for shipment',
        updatedBy: staff.id,
      },
      {
        parcelId: parcel1.id,
        status: 'IN_TRANSIT',
        location: 'Enugu Route',
        description: 'Parcel in transit to destination',
        updatedBy: staff.id,
      },
      {
        parcelId: parcel2.id,
        status: 'PENDING',
        location: 'Abuja Office',
        description: 'Parcel received and pending processing',
        updatedBy: staff.id,
      },
      {
        parcelId: parcel2.id,
        status: 'PENDING',
        location: 'Abuja Office',
        description: 'Parcel being processed for shipment',
        updatedBy: staff.id,
      },
    ],
  });

  console.log('Database seeded successfully!');
  console.log('Admin login credentials:');
  console.log('Email: admin@nipost.gov.ng');
  console.log('Password: admin123');
  console.log('');
  console.log('Staff login credentials:');
  console.log('Email: staff@nipost.gov.ng');
  console.log('Password: staff123');
  console.log('');
  console.log('Customer login credentials:');
  console.log('Email: customer@example.com');
  console.log('Password: customer123');
  console.log('');
  console.log('Sample tracking IDs:');
  console.log('NIP2024001');
  console.log('NIP2024002');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });