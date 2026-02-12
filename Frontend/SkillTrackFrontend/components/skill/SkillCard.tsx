import { Pressable, StyleSheet } from 'react-native';
import { AppText } from "@/components/AppText";
import { Ionicons } from '@expo/vector-icons';

interface Skill {
  skillName: string;
  status: boolean;
}

interface SkillCardProps {
    skill: Skill
    onPress: (skill: Skill) => void
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill, onPress }: SkillCardProps) => {
    return (
        <Pressable
            style={styles.skillCard}
            onPress={() => onPress(skill)}>
            
            <AppText style={styles.skillName}>
                {skill.skillName}
            </AppText>

            {skill.status && 
                <Ionicons
                    name="checkmark-outline"
                    size={28}
                    color="#4972FF"
                />}
        </Pressable>
    )
}

const styles = StyleSheet.create({

    skillCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        marginHorizontal: 5,
        paddingVertical: 10,
        paddingHorizontal: 15,
        gap: 15,
        borderRadius: 25,
        backgroundColor: '#F5F5F5'
    },

    skillName: {
        fontSize: 20
    }
})