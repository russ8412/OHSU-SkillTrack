import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { BASE_URL } from '@/src/constants/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useEffect, useState } from "react";
import { Redirect } from 'expo-router';

async function fetchUser() {

    const session = await fetchAuthSession()
    const token = session.tokens?.idToken?.toString()
    if (!token) {
        throw new Error("No idToken found")
    }

    const response = await fetch(`${BASE_URL}/FetchUserData`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        }
    })
    return response.json()
}

export default function Index() {
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<"Student" | "Teacher" | null>(null);

    useEffect(() => {
        async function loadUser() {
            try {
                const user = await fetchUser()
                setRole(user.Roles[0])
            }
            catch (e) {
                console.error("Failed to get user data", e)
            }
            finally {
                setLoading(false)
            }
        }
        loadUser()
    }, [])

    if (loading) {
        return (
            <LoadingScreen/>
        )
    }
    if (role === "Student") {
        return <Redirect href="/(student)/(tabs)"/>
    }
    if (role === "Teacher") {
        return <Redirect href="/(instructor)/(tabs)"/>
    }
    return null
}