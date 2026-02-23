import { db } from './firebase-config.js';
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Mock Data for fallback
const MOCK_LAPTOPS = [
    {
        id: "1",
        brand: "Apple",
        model: "MacBook Air M1",
        specs: { processor: "M1", ram: "8GB", storage: "256GB SSD" },
        price_per_day: 49,
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI3MDAiIHZpZXdCb3g9IjAgMCAxMDAwIDcwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMDAiIGhlaWdodD0iNzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5NYWNCb29rIEFpciBNMTwvdGV4dD4KPC9zdmc+",
        available: true,
        category: "Ultrabook"
    },
    {
        id: "2",
        brand: "Dell",
        model: "XPS 13",
        specs: { processor: "i7 11th Gen", ram: "16GB", storage: "512GB SSD" },
        price_per_day: 59,
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI3MDAiIHZpZXdCb3g9IjAgMCAxMDAwIDcwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMDAiIGhlaWdodD0iNzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5EZWxsIFhQUyAxMzwvdGV4dD4KPC9zdmc+",
        available: false,
        category: "Windows Premier"
    },
    {
        id: "3",
        brand: "Lenovo",
        model: "ThinkPad X1 Carbon",
        specs: { processor: "i7 12th Gen", ram: "16GB", storage: "1TB SSD" },
        price_per_day: 65,
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI3MDAiIHZpZXdCb3g9IjAgMCAxMDAwIDcwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMDAiIGhlaWdodD0iNzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5MZW5vdm8gVGhpbmtQYWR4PC90ZXh0Pgo8L3N2Zz4=",
        available: true,
        category: "Business"
    },
    {
        id: "4",
        brand: "HP",
        model: "Pavilion 15",
        specs: { processor: "Ryzen 5", ram: "8GB", storage: "512GB SSD" },
        price_per_day: 35,
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI3MDAiIHZpZXdCb3g9IjAgMCAxMDAwIDcwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMDAiIGhlaWdodD0iNzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5IEEgUGF2aWxpb24gMTU8L3RleHQ+Cjwvc3ZnPg==",
        available: true,
        category: "Budget Friendly"
    },
    {
        id: "5",
        brand: "ASUS",
        model: "ROG Zephyrus G14",
        specs: { processor: "Ryzen 9", ram: "16GB", storage: "1TB SSD" },
        price_per_day: 75,
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI3MDAiIHZpZXdCb3g9IjAgMCAxMDAwIDcwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMDAiIGhlaWdodD0iNzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BU1VTIFJPRyBaZXBoeXJ1czwvdGV4dD4KPC9zdmc+",
        available: true,
        category: "Gaming/High Performance"
    },
    {
        id: "6",
        brand: "Acer",
        model: "Aspire 5",
        specs: { processor: "i5 11th Gen", ram: "8GB", storage: "512GB SSD" },
        price_per_day: 29,
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI3MDAiIHZpZXdCb3g9IjAgMCAxMDAwIDcwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMDAiIGhlaWdodD0iNzAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BY2VyIEFzcGlyZSA1PC90ZXh0Pgo8L3N2Zz4=",
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

        const docRef = await addDoc(collection(db, "orders"), {
            ...orderData,
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
        return { success: true };
    } catch (error) {
        console.error("Error updating order:", error);
        return { success: false, error: error.message };
    }
}

export { getLaptops, getLaptopById, createOrder, getOrdersByStudent, addLaptop, getAllOrders, updateOrderStatus, MOCK_LAPTOPS };



