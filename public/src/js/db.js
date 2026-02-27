import { db } from './firebase-config.js';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Mock Data for fallback
const MOCK_LAPTOPS = [
    {
        id: "1",
        brand: "Apple",
        model: "MacBook Air M1",
        specs: { processor: "M1", ram: "8GB", storage: "256GB SSD" },
        price_per_day: 49,
        image: "https://i.ytimg.com/vi/FarPVvHpARA/maxresdefault.jpg",
        available: true,
        category: "Ultrabook"
    },
    {
        id: "2",
        brand: "Dell",
        model: "XPS 13",
        specs: { processor: "i7 11th Gen", ram: "16GB", storage: "512GB SSD" },
        price_per_day: 59,
        image: "https://www.notebookcheck.net/fileadmin/Notebooks/News/_nc4/Dell-XPS-13-9340-laptop.JPG",
        available: false,
        category: "Windows Premier"
    },
    {
        id: "3",
        brand: "Lenovo",
        model: "ThinkPad X1 Carbon",
        specs: { processor: "i7 12th Gen", ram: "16GB", storage: "1TB SSD" },
        price_per_day: 65,
        image: "https://images.unsplash.com/photo-1588872657578-a3d2e184590c?auto=format&fit=crop&q=80&w=1000",
        available: true,
        category: "Business"
    },
    {
        id: "4",
        brand: "HP",
        model: "Pavilion 15",
        specs: { processor: "Ryzen 5", ram: "8GB", storage: "512GB SSD" },
        price_per_day: 35,
        image: "https://images.unsplash.com/photo-1589561276602-fa6372404f18?auto=format&fit=crop&q=80&w=1000",
        available: true,
        category: "Budget Friendly"
    },
    {
        id: "5",
        brand: "ASUS",
        model: "ROG Zephyrus G14",
        specs: { processor: "Ryzen 9", ram: "16GB", storage: "1TB SSD" },
        price_per_day: 75,
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=1000",
        available: true,
        category: "Gaming/High Performance"
    },
    {
        id: "6",
        brand: "Acer",
        model: "Aspire 5",
        specs: { processor: "i5 11th Gen", ram: "8GB", storage: "512GB SSD" },
        price_per_day: 29,
        image: "https://images.unsplash.com/photo-1544731612-de7f96afe55f?auto=format&fit=crop&q=80&w=1000",
        available: true,
        category: "Student Essentials"
    }
];

// Fetch all laptops
async function getLaptops() {
    try {
        if (!db) throw new Error("Database not initialized");
        const querySnapshot = await getDocs(collection(db, "laptops"));
        if (querySnapshot.empty) {
            console.warn("Firestore collection 'laptops' is empty. Returning mock data.");
            return MOCK_LAPTOPS;
        }
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.warn("Error fetching laptops from Firestore:", error);
        return MOCK_LAPTOPS; // Fallback to mock data
    }
}

// Get single laptop by ID
async function getLaptopById(id) {
    // Check mock data first if DB fails
    const mock = MOCK_LAPTOPS.find(l => l.id === id);

    try {
        if (!db) return mock;
        const docRef = doc(db, "laptops", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        } else {
            console.log("No such document!");
            return mock;
        }
    } catch (error) {
        return mock;
    }
}

// Create a new rental order
async function createOrder(orderData) {
    try {
        if (!db) {
            console.warn("Database not initialized, simulating order creation.");
            return { success: true, id: "MOCK_ORDER_" + Date.now() };
        }

        // Fix #7: Server-side duration validation
        const duration = parseInt(orderData.duration);
        if (isNaN(duration) || duration < 3 || duration > 180) {
            return { success: false, error: "Rental duration must be between 3 and 180 days." };
        }

        // Fix #12: Prevent duplicate active orders for the same laptop by the same student
        const dupQuery = query(
            collection(db, "orders"),
            where("studentId", "==", orderData.studentId),
            where("laptopId", "==", orderData.laptopId),
            where("status", "==", "pending"),
            limit(1)
        );
        const dupSnap = await getDocs(dupQuery);
        if (!dupSnap.empty) {
            return { success: false, error: "You already have a pending request for this laptop." };
        }

        const docRef = await addDoc(collection(db, "orders"), {
            ...orderData,
            duration: duration,
            createdAt: new Date().toISOString(),
            status: 'pending'
        });

        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating order:", error);
        return { success: false, error: error.message };
    }
}

// Get orders for a specific student
async function getOrdersByStudent(studentId) {
    try {
        if (!db) return []; // Return empty if no DB

        const q = query(collection(db, "orders"), where("studentId", "==", studentId));
        const querySnapshot = await getDocs(q);

        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
}

// --- Vendor Functions ---
async function addLaptop(laptopData) {
    try {
        if (!db) return { success: true, id: "MOCK_LAPTOP_" + Date.now() };

        const docRef = await addDoc(collection(db, "laptops"), {
            ...laptopData,
            createdAt: new Date().toISOString(),
            available: true
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding laptop:", error);
        return { success: false, error: error.message };
    }
}

// Fix #10: Get laptops for a specific vendor efficiently using a Firestore query
async function getLaptopsByVendor(vendorId) {
    try {
        if (!db) return [];
        const q = query(collection(db, "laptops"), where("vendorId", "==", vendorId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error("Error fetching vendor laptops:", error);
        return [];
    }
}

// Get orders for a specific vendor (by vendorId stored on the order)
async function getOrdersByVendor(vendorId) {
    try {
        if (!db) return [];
        const q = query(collection(db, "orders"), where("vendorId", "==", vendorId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching vendor orders:", error);
        return [];
    }
}

// Delete a laptop listing
async function deleteLaptop(laptopId) {
    try {
        if (!db) return { success: true };
        await deleteDoc(doc(db, "laptops", laptopId));
        return { success: true };
    } catch (error) {
        console.error("Error deleting laptop:", error);
        return { success: false, error: error.message };
    }
}

// --- Admin Functions ---
async function getAllOrders() {
    try {
        if (!db) return [];
        const querySnapshot = await getDocs(collection(db, "orders"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching all orders:", error);
        return [];
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        if (!db) return { success: true };
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, { status: status });

        // Fix #5: When an order is approved, mark the laptop as unavailable
        if (status === 'approved') {
            const orderSnap = await getDoc(orderRef);
            if (orderSnap.exists()) {
                const laptopId = orderSnap.data().laptopId;
                if (laptopId) {
                    const laptopRef = doc(db, "laptops", laptopId);
                    await updateDoc(laptopRef, { available: false });
                }
            }
        }

        // If an order is rejected/cancelled, re-mark the laptop as available
        if (status === 'rejected') {
            const orderSnap = await getDoc(orderRef);
            if (orderSnap.exists()) {
                const laptopId = orderSnap.data().laptopId;
                if (laptopId) {
                    const laptopRef = doc(db, "laptops", laptopId);
                    await updateDoc(laptopRef, { available: true });
                }
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error updating order:", error);
        return { success: false, error: error.message };
    }
}

export { getLaptops, getLaptopById, createOrder, getOrdersByStudent, addLaptop, getAllOrders, updateOrderStatus, getOrdersByVendor, getLaptopsByVendor, deleteLaptop, MOCK_LAPTOPS };



