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
    paddingTop: 4,
    gap: 20  },
  // -------------------- general styles --------------------

  //-------------------- courses-by-year page -------------------- 
    loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

  loadingHeader: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4972FF',
    marginBottom: 4,
  },

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
  },

  courseHeader: {
    marginBottom: 12,
  },

  courseName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000',
    flex: 1,
    marginRight: 12,
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

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
  },

  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
    color: '#8E8E93',
  },

  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },

  emptyStateText: {
    fontSize: 17,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  //-------------------- courses-by-year page -------------------- 

});

export default generalStyles;
