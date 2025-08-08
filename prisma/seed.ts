import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper functions to generate ID formats
function generateCustomerId(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `NIPCUS${timestamp}${random}`;
}

function generateStaffId(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `NIPSTFF${timestamp}${random}`;
}

function generateAdminId(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `NIPADM${timestamp}${random}`;
}

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nipost.gov.ng' },
    update: {},
    create: {
      id: generateAdminId(),
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
      id: generateStaffId(),
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
      id: generateCustomerId(),
      email: 'customer@example.com',
      passwordHash: customerPassword,
      name: 'Jane Smith',
      phone: '+2348000000003',
      role: 'CUSTOMER',
    },
  });

  // Create additional sample users for testing
  const customer2Password = await bcrypt.hash('customer123', 12);
  const customer2 = await prisma.user.upsert({
    where: { email: 'customer2@example.com' },
    update: {},
    create: {
      id: generateCustomerId(),
      email: 'customer2@example.com',
      passwordHash: customer2Password,
      name: 'Alice Johnson',
      phone: '+2348000000004',
      role: 'CUSTOMER',
    },
  });

  const staff2Password = await bcrypt.hash('staff123', 12);
  const staff2 = await prisma.user.upsert({
    where: { email: 'staff2@nipost.gov.ng' },
    update: {},
    create: {
      id: generateStaffId(),
      email: 'staff2@nipost.gov.ng',
      passwordHash: staff2Password,
      name: 'Mike Wilson',
      phone: '+2348000000005',
      role: 'STAFF',
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
  console.log(`Admin ID: ${admin.id}`);
  console.log('');
  console.log('Staff login credentials:');
  console.log('Email: staff@nipost.gov.ng');
  console.log('Password: staff123');
  console.log(`Staff ID: ${staff.id}`);
  console.log('');
  console.log('Customer login credentials:');
  console.log('Email: customer@example.com');
  console.log('Password: customer123');
  console.log(`Customer ID: ${customer.id}`);
  console.log('');
  console.log('Sample tracking IDs:');
  console.log('NIP2024001');
  console.log('NIP2024002');
  console.log('');
  console.log('Additional users created:');
  console.log(`Customer2 ID: ${customer2.id} (customer2@example.com)`);
  console.log(`Staff2 ID: ${staff2.id} (staff2@nipost.gov.ng)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });