import { StyleSheet } from 'react-native';

const generalStyles = StyleSheet.create({
  // -------------------- general styles --------------------
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  
  // may need to update this because year isn't exactly centered
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: {
    // figma has fontsize 35
    fontSize: 35,
    fontWeight: '400',
    color: '#111111',
    textAlign: 'center',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: '#ECECEC',
    marginBottom: 16,
    width: '90%',
    alignSelf: 'center',
  },

  searchInput: {
    fontFamily: 'Afacad',
    flex: 1,
    // figma has font size 22.5
    fontSize: 22.5,
    color: '#111111',
    paddingVertical: 6,
    paddingRight: 10,
  },

  listContent: {
    paddingBottom: 20,
  },

  // styling for course name and skill names
  cardNameText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 12,
  },

  emptySearchContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 25
  },

  emptySearchText: {
    fontSize: 20,
    color: '#919191',
  },
  // -------------------- general styles --------------------

  //-------------------- courses page -------------------- 

  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
  },

  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },

  courseCard: {
    backgroundColor: '#F4F4F4',
    borderRadius: 30,
    padding: 16,
    marginBottom: 20,
  },

  courseHeader: {
    marginBottom: 12,
  },

  courseProgressText: {
    // figma has font size 15
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
    marginTop: 8,
  },

  progressBar: {
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    overflow: 'hidden',
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#4972FF',
    borderRadius: 2,
  },

  refreshButton: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: '#4972FF',
    borderRadius: 10,
  },

  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  //-------------------- courses page -------------------- 

  // ------------------- skills page --------------------

  // may want to consider splitting courseID and name in DB to reflect figma
  courseHeaderTitle: {
    fontSize: 22.5,
    color: '#000000',
    maxWidth: "70%",
    textAlign: 'center',
  },

    filterContainer: {
    marginBottom: 16,
    alignSelf: 'center',
  },

  filterScroll: {
    maxHeight: 40,
  },

  filterButton: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  activeFilterButton: {
    backgroundColor: '#4972FF',
  },
  filterButtonText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#000000',
  },
  activeFilterButtonText: {
    color: '#F4F4F4',
  },

  // may consider generalizing this style to just be cars
  skillCard: {
  backgroundColor: '#F4F4F4',
  borderRadius: 30,
  padding: 12,
  marginBottom: 20,
  // flexDirection: 'row',
  // alignItems: 'center',
  // justifyContent: 'space-between',
  },

  skillInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  // ------------------- profile page --------------------
  profileCard: {
    backgroundColor: '#F4F4F4',
    borderRadius: 30,
    padding: 24,
    marginBottom: 24,
  },

  profileNameText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },

  profileEmailText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 16,
  },

  profileDivider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginBottom: 16,
  },

  profileProgressLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 8,
  },

  profileSkillsCountText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4972FF',
    marginBottom: 12,
  },

  profileLogoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  // ------------------- profile page --------------------
});

export default generalStyles;
