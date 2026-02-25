import { fetchAuthSession } from 'aws-amplify/auth';

import { FlatList, View } from "react-native";
import { useEffect, useMemo, useState } from "react";

import { BASE_URL } from '@/src/constants/api';

import { AppText } from "@/components/AppText";
import { SearchBar } from "@/components/ui/SearchBar";
import { CourseCard } from "@/components/course/CourseCard";
import { Header } from "@/components/ui/Header";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

import styles from "@/app/styles";

interface SkillData {
    CheckedOff: boolean;
    CheckedOffBy?: string;
    DateCheckedOff?: string;
}

interface Course {
    courseId: string
    courseName: string
    totalSkills: number
    completedSkills: number
}

interface StudentData {
    Email: string
    FirstName?: string | null
    LastName?: string | null
    Roles?: string | null
    Courses?: Record<
        string,
        {
            CourseName?: string
            Skills?: Record<string, SkillData>
        }
    >;
}

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
    if (!response.ok) {
        throw new Error("Failed to fetch user data")
    }
    return response.json()
}

export default function Courses() {
    const [error, setError] = useState(false)
    const [loading, setLoading] = useState(true)
    const [courses, setCourses] = useState<Course[]>([])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        async function loadUser() {
            try {
                const user: StudentData = await fetchUser()
                console.log(user)

                const courses = user.Courses
                const coursesParsed: Course[] = []

                if (!courses) {
                    return
                }

                Object.entries(courses).forEach(([courseId, course]) => {

                    const courseName = !course.CourseName ? "Unnamed course" : course.CourseName
                    const skillsArr = Object.values(course.Skills ?? {});
                    const totalSkills = skillsArr.length;
                    const completedSkills = skillsArr.filter((s) => s.CheckedOff).length;
                    
                    const newCourse: Course = { courseId, courseName, totalSkills, completedSkills }
                    coursesParsed.push(newCourse)
                })

                setCourses(coursesParsed)
            }
            catch (e) {
                setError(true)
                console.error("Failed to fetch user data", e)
            }
            finally {
                setLoading(false)
            }
        }
        loadUser()
    }, [])

    const filteredCourses = useMemo(() => {
        const q = searchQuery.trim().toLowerCase()

        if (!q) {
            return courses
        }
        return courses.filter((c) =>
            (c.courseName ?? '').toLowerCase().includes(q)
        )
    }, [courses, searchQuery])

    function handleCoursePress(course: Course) {
        return
    }

    const renderCourse = ({ item }: { item: Course }) => {
        return (
            <CourseCard course={item} onPress={handleCoursePress} />
        )
    }

    if (loading) {
        return (
            <LoadingScreen />
        )
    }

    if (error) {
        return (
            <AppText>Error. Can't fetch data</AppText>
        )
    }

    return (
        <View>
            <Header text="My Courses" backArrow={false} />
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <FlatList
                data={filteredCourses}
                renderItem={renderCourse}
                keyExtractor={(item) => `${item.courseId}`}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false} />
        </View>
    )
}