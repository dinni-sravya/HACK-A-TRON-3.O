// Group Service - Firestore operations for group management
import { db } from './firebase';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    updateDoc,
    arrayUnion
} from 'firebase/firestore';
import { getGroupMatchingSuggestions } from './geminiService';

const GROUPS_COLLECTION = 'groups';
const USERS_COLLECTION = 'users';

/**
 * Create a new travel group
 * @param {object} tripData - Trip details (origin, destination)
 * @param {object} user - User creating the group
 * @returns {Promise<object>} - Created group data
 */
export const createGroup = async (tripData, user) => {
    try {
        const groupRef = doc(collection(db, GROUPS_COLLECTION));

        // Get AI suggestions for the group
        const aiSuggestions = await getGroupMatchingSuggestions(tripData, 1);

        const groupData = {
            id: groupRef.id,
            origin: tripData.origin,
            destination: tripData.destination,
            members: [user.uid],
            memberCount: 1,
            maxMembers: 4,
            status: 'searching', // searching, full, in-progress, completed
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            groupName: aiSuggestions.groupName || 'Travel Group',
            aiMatchQuality: aiSuggestions.matchQuality,
            travelAdvice: aiSuggestions.travelAdvice
        };

        await setDoc(groupRef, groupData);
        return groupData;
    } catch (error) {
        console.error('Error creating group:', error);
        throw error;
    }
};

/**
 * Find matching groups for a trip
 * @param {object} tripData - Trip details (origin, destination coordinates)
 * @param {number} radiusKm - Search radius in kilometers
 * @returns {Promise<array>} - Matching groups
 */
export const findMatchingGroups = async (tripData, radiusKm = 3) => {
    try {
        // Query groups with same destination (simplified matching)
        // In production, use geohashing for location-based queries
        const groupsRef = collection(db, GROUPS_COLLECTION);
        const q = query(
            groupsRef,
            where('status', '==', 'searching'),
            orderBy('createdAt', 'desc'),
            limit(10)
        );

        const snapshot = await getDocs(q);
        const groups = [];

        snapshot.forEach((doc) => {
            const data = doc.data();
            // Check if destination is similar (within radiusKm)
            if (data.destination && tripData.destination) {
                const distance = calculateSimpleDistance(
                    data.destination.lat,
                    data.destination.lng,
                    tripData.destination.lat,
                    tripData.destination.lng
                );

                if (distance <= radiusKm) {
                    groups.push({ id: doc.id, ...data });
                }
            }
        });

        return groups;
    } catch (error) {
        console.error('Error finding groups:', error);
        // Return empty array if Firestore not configured
        return [];
    }
};

/**
 * Join an existing group
 * @param {string} groupId - Group ID to join
 * @param {object} user - User joining the group
 * @returns {Promise<object>} - Updated group data
 */
export const joinGroup = async (groupId, user) => {
    try {
        const groupRef = doc(db, GROUPS_COLLECTION, groupId);
        const groupDoc = await getDoc(groupRef);

        if (!groupDoc.exists()) {
            throw new Error('Group not found');
        }

        const groupData = groupDoc.data();

        if (groupData.memberCount >= groupData.maxMembers) {
            throw new Error('Group is full');
        }

        if (groupData.members.includes(user.uid)) {
            throw new Error('Already a member of this group');
        }

        const newMemberCount = groupData.memberCount + 1;
        const newStatus = newMemberCount >= groupData.maxMembers ? 'full' : 'searching';

        await updateDoc(groupRef, {
            members: arrayUnion(user.uid),
            memberCount: newMemberCount,
            status: newStatus,
            updatedAt: serverTimestamp()
        });

        return {
            ...groupData,
            memberCount: newMemberCount,
            status: newStatus
        };
    } catch (error) {
        console.error('Error joining group:', error);
        throw error;
    }
};

/**
 * Get group details by ID
 * @param {string} groupId - Group ID
 * @returns {Promise<object|null>} - Group data
 */
export const getGroup = async (groupId) => {
    try {
        const groupRef = doc(db, GROUPS_COLLECTION, groupId);
        const groupDoc = await getDoc(groupRef);

        if (groupDoc.exists()) {
            return { id: groupDoc.id, ...groupDoc.data() };
        }
        return null;
    } catch (error) {
        console.error('Error getting group:', error);
        return null;
    }
};

/**
 * Simple distance calculation (Haversine formula)
 */
const calculateSimpleDistance = (lat1, lng1, lat2, lng2) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return Infinity;

    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);
