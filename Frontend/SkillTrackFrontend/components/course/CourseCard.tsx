import { View, Pressable, StyleSheet } from 'react-native';
import { AppText } from "@/components/AppText";

interface Course {
    courseId: string
    courseName: string
    totalSkills: number
    completedSkills: number
}

interface CourseCardProps {
    course: Course
    onPress: (course: Course) => void
}

function getProgressPercentage(complete: number, total: number) {
    if (total === 0) {
        return 0;
    }
    return Math.round((complete / total) * 100);
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onPress }: CourseCardProps) => {
    return (
        <Pressable
            style={styles.courseCard}
            onPress={() => onPress(course)}>

            <View style={styles.header}>
                <AppText style={styles.courseTitle}>
                    {course.courseName}
                </AppText>
                <AppText style={styles.skillsCompleteText}>
                    {course.completedSkills}/{course.totalSkills} skills complete
                </AppText>
            </View>

            {/* May need to investigate how to replace progress bar with a completed check mark once a user has completed all tasks... */}
            <View style={styles.progressBar}>
                <View
                    style={[
                        styles.progressFill,
                        { width: `${getProgressPercentage(course.completedSkills, course.totalSkills)}%` }
                    ]}
                />
            </View>
        </Pressable>
    )
}

const styles = StyleSheet.create({

    courseCard: {
        justifyContent: 'space-between',
        marginBottom: 20,
        marginHorizontal: 5,
        paddingVertical: 10,
        paddingHorizontal: 15,
        gap: 15,
        borderRadius: 25,
        backgroundColor: '#F5F5F5'
    },

    header: {
        gap: 4
    },

    courseTitle: {
        fontSize: 20
    },

    skillsCompleteText: {
        fontSize: 15
    },

    progressBar: {
        height: 3,
        borderRadius: 1.5,
        backgroundColor: "#F5F5F5"
    },

    progressFill: {
        height: 3,
        borderRadius: 1.5,
        backgroundColor: "#4972FF"
    }
})