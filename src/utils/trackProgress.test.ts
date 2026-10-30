import { getTopicStorageKey, isTopicCAdv, isTopicCInt } from './trackProgress';

function runTrackProgressTests() {
  console.log('--- Running trackProgress Tests ---');

  // Test storage keys
  console.assert(getTopicStorageKey('top-cpp-1') === 'cog_cpp_progress', 'C++ storage key');
  console.assert(getTopicStorageKey('top-cpp-oop-1') === 'cog_cpp_oop_progress', 'C++ OOP key');
  console.assert(getTopicStorageKey('top-cpp-adv-1') === 'cog_cpp_adv_progress', 'C++ Adv key');
  console.assert(getTopicStorageKey('top-c-pointers') === 'cog_c_progress', 'C Foundations key');
  console.assert(getTopicStorageKey('top-java-1') === 'cog_java_progress', 'Java Basics key');
  console.assert(getTopicStorageKey('top-java-oop-1') === 'cog_java_oop_progress', 'Java OOP key');
  console.assert(getTopicStorageKey('top-java-adv-1') === 'cog_java_adv_progress', 'Java Adv key');
  console.assert(getTopicStorageKey('top-py-loops') === 'cog_python_progress', 'Python key');

  // Test detection helpers
  console.assert(isTopicCAdv('top-c-adv-1') === true, 'isTopicCAdv check');
  console.assert(isTopicCAdv('top-c-pointers') === false, 'isTopicCAdv false check');

  console.log('✓ All trackProgress Tests Passed successfully!');
}

runTrackProgressTests();

