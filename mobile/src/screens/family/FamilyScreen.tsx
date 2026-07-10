import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '@/constants/theme';
import { familyService } from '@/services';
import { Button } from '@/components/ui';
import * as Haptics from '@/utils/haptics';

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  role: 'admin' | 'manager' | 'viewer';
  email?: string;
  mobile?: string;
}

const RELATIONS = ['Father', 'Mother', 'Brother', 'Sister', 'Uncle', 'Aunt', 'Guardian', 'Other'];
const ROLES: { key: FamilyMember['role']; label: string; desc: string }[] = [
  { key: 'admin', label: 'Admin', desc: 'Full access to manage profile & matches' },
  { key: 'manager', label: 'Manager', desc: 'Can view matches & send interests' },
  { key: 'viewer', label: 'Viewer', desc: 'Can only view profile & activity' },
];

const roleColor = (role: string) =>
  role === 'admin' ? Colors.primary : role === 'manager' ? Colors.accent : Colors.textTertiary;

export const FamilyScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('Father');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [role, setRole] = useState<FamilyMember['role']>('viewer');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const res = await familyService.getMembers();
      setMembers(res.data?.members || []);
    } catch {
      setMembers([]);
    }
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter the family member\'s name');
      return;
    }
    setSaving(true);
    try {
      await familyService.addMember({ name, relation, email, mobile, role });
      Haptics.success();
      await loadMembers();
    } catch {
      // Optimistic local add if backend unavailable
      setMembers((prev) => [
        ...prev,
        { id: Date.now().toString(), name, relation, role, email, mobile },
      ]);
    } finally {
      setSaving(false);
      resetForm();
      setModalVisible(false);
    }
  };

  const resetForm = () => {
    setName(''); setRelation('Father'); setEmail(''); setMobile(''); setRole('viewer');
  };

  const handleRemove = (id: string) => {
    Alert.alert('Remove Member', 'Remove this family member from your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          setMembers((prev) => prev.filter((m) => m.id !== id));
          try { await familyService.removeMember(id); } catch {}
        },
      },
    ]);
  };

  const renderMember = ({ item }: { item: FamilyMember }) => (
    <View style={styles.memberCard}>
      <View style={[styles.avatar, { backgroundColor: roleColor(item.role) + '18' }]}>
        <Text style={[styles.avatarText, { color: roleColor(item.role) }]}>
          {item.name.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberRelation}>{item.relation}</Text>
        <View style={[styles.roleBadge, { backgroundColor: roleColor(item.role) + '15' }]}>
          <Text style={[styles.roleBadgeText, { color: roleColor(item.role) }]}>
            {item.role.charAt(0).toUpperCase() + item.role.slice(1)}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.removeBtn}>
        <Ionicons name="trash-outline" size={20} color={Colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={members}
        renderItem={renderMember}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <LinearGradient
            colors={Colors.gradientSunset as any}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.banner}
          >
            <Ionicons name="people" size={30} color={Colors.white} />
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Text style={styles.bannerTitle}>Family-Assisted Matchmaking</Text>
              <Text style={styles.bannerSub}>Let your parents & relatives help find your perfect match with controlled access</Text>
            </View>
          </LinearGradient>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No Family Members Yet</Text>
            <Text style={styles.emptySub}>Add your parents or relatives to help manage your matches</Text>
          </View>
        }
      />

      <View style={styles.addBar}>
        <Button title="+ Add Family Member" onPress={() => setModalVisible(true)} variant="gradient" size="lg" fullWidth />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Family Member</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Name *</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={Colors.textTertiary} />

              <Text style={styles.label}>Relation</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
                {RELATIONS.map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.optChip, relation === r && styles.optChipActive]}
                    onPress={() => setRelation(r)}
                  >
                    <Text style={[styles.optChipText, relation === r && styles.optChipTextActive]}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.label}>Mobile</Text>
              <TextInput style={styles.input} value={mobile} onChangeText={setMobile} placeholder="Mobile number" placeholderTextColor={Colors.textTertiary} keyboardType="phone-pad" />

              <Text style={styles.label}>Email (optional)</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor={Colors.textTertiary} keyboardType="email-address" autoCapitalize="none" />

              <Text style={styles.label}>Access Level</Text>
              {ROLES.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={[styles.roleOption, role === r.key && styles.roleOptionActive]}
                  onPress={() => setRole(r.key)}
                >
                  <View style={styles.radio}>
                    {role === r.key && <View style={styles.radioDot} />}
                  </View>
                  <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <Text style={styles.roleLabel}>{r.label}</Text>
                    <Text style={styles.roleDesc}>{r.desc}</Text>
                  </View>
                </TouchableOpacity>
              ))}

              <View style={{ height: Spacing.md }} />
              <Button title="Add Member" onPress={handleAdd} variant="gradient" size="lg" loading={saving} fullWidth />
              <View style={{ height: Spacing.xl }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...Typography.headline, color: Colors.textPrimary },
  list: { padding: Spacing.xl, paddingBottom: 100 },
  banner: {
    flexDirection: 'row', alignItems: 'center',
    padding: Spacing.lg, borderRadius: BorderRadius.lg, marginBottom: Spacing.lg,
  },
  bannerTitle: { ...Typography.bodyBold, color: Colors.white },
  bannerSub: { ...Typography.caption1, color: Colors.white, opacity: 0.9, marginTop: 2 },
  memberCard: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm, ...Shadows.small,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...Typography.title3 },
  memberInfo: { flex: 1, marginLeft: Spacing.md },
  memberName: { ...Typography.bodyBold, color: Colors.textPrimary },
  memberRelation: { ...Typography.caption1, color: Colors.textSecondary },
  roleBadge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm, marginTop: 4 },
  roleBadgeText: { ...Typography.caption2, fontWeight: '700' },
  removeBtn: { padding: Spacing.sm },
  emptyState: { alignItems: 'center', paddingTop: 40 },
  emptyTitle: { ...Typography.bodyBold, color: Colors.textPrimary, marginTop: Spacing.md },
  emptySub: { ...Typography.caption1, color: Colors.textTertiary, marginTop: Spacing.xs, textAlign: 'center', paddingHorizontal: Spacing.xl },
  addBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Spacing.xl, backgroundColor: Colors.surface,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: Colors.surface, borderTopLeftRadius: BorderRadius.xxl, borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.xl, maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  modalTitle: { ...Typography.title3, color: Colors.textPrimary },
  label: { ...Typography.footnote, color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.sm },
  input: {
    ...Typography.body, color: Colors.textPrimary,
    backgroundColor: Colors.background, borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm,
  },
  optChip: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full, backgroundColor: Colors.background,
    marginRight: Spacing.sm, borderWidth: 1, borderColor: Colors.border,
  },
  optChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  optChipText: { ...Typography.footnote, color: Colors.textSecondary },
  optChipTextActive: { color: Colors.white, fontWeight: '600' },
  roleOption: {
    flexDirection: 'row', alignItems: 'center', padding: Spacing.md,
    borderRadius: BorderRadius.md, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  roleOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.primary },
  roleLabel: { ...Typography.bodyBold, color: Colors.textPrimary },
  roleDesc: { ...Typography.caption1, color: Colors.textSecondary, marginTop: 1 },
});
