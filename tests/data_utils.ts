import * as vue_test_utils from '@vue/test-utils';

import {
    AGCommand,
    AGTestCase,
    AGTestCaseFeedbackConfig,
    AGTestCommand,
    AGTestCommandFeedbackConfig,
    AGTestSuite,
    AGTestSuiteFeedbackConfig,
    BugsExposedFeedbackLevel,
    Course,
    ExpectedOutputSource,
    ExpectedReturnCode,
    ExpectedStudentFile,
    Group,
    MutationTestSuite,
    MutationTestSuiteFeedbackConfig,
    Project,
    Semester,
    StdinSource,
    UltimateSubmissionPolicy,
    User,
    UserRoles,
    ValueFeedbackLevel,
} from 'ag-client-typescript';

import { GlobalData } from '@/app.vue';
import { safe_assign } from "@/utils";

function* counter() {
    let count = 1;
    while (true) {
        yield count;
        count += 1;
    }
}

export function set_global_current_user(user: User) {
    let globals = new GlobalData();
    globals.current_user = user;
    vue_test_utils.config.provide!['globals'] = globals;
}

const USER_PKS = counter();

export function make_user(args: Partial<User> = {}): User {
    let defaults = {
        pk: USER_PKS.next().value,
        username: `user_${random_id()}`,
        first_name: `First${random_id()}`,
        last_name: `Last${random_id()}`,
        email: '',
        is_superuser: false,
    };
    safe_assign(defaults, args);
    return new User(defaults);
}

export function make_user_roles(args: Partial<UserRoles> = {}): UserRoles {
    let defaults = {
        is_admin: false,
        is_staff: false,
        is_student: false,
        is_handgrader: false,
    };
    safe_assign(defaults, args);
    return new UserRoles(defaults);
}

const COURSE_PKS = counter();

export function make_course(args: Partial<Course> = {}): Course {
    let defaults = {
        pk: COURSE_PKS.next().value,
        name: `Course ${random_id()}`,
        semester: Semester.winter,
        year: 2019,
        subtitle: '',
        num_late_days: 0,
        allowed_guest_domain: '',
        last_modified: now_str()
    };
    safe_assign(defaults, args);
    return new Course(defaults);
}

const PROJECT_PKS = counter();

export function make_project(course_pk: number, args: Partial<Project> = {}): Project {
    let defaults = {
        pk: PROJECT_PKS.next().value,
        name: `Project ${random_id()}`,
        course: course_pk,
        last_modified: now_str(),
        visible_to_students: true,
        closing_time: null,
        soft_closing_time: null,
        disallow_student_submissions: true,
        disallow_group_registration: true,
        guests_can_submit: true,
        min_group_size: 1,
        max_group_size: 1,
        submission_limit_per_day: null,
        allow_submissions_past_limit: true,
        groups_combine_daily_submissions: false,
        submission_limit_reset_time: "",
        submission_limit_reset_timezone: "",
        num_bonus_submissions: 0,
        total_submission_limit: null,
        allow_late_days: true,
        ultimate_submission_policy: UltimateSubmissionPolicy.best,
        hide_ultimate_submission_fdbk: false,
        instructor_files: [],
        expected_student_files: [],
        has_handgrading_rubric: false,
    };
    safe_assign(defaults, args);
    defaults.course = course_pk;
    return new Project(defaults);
}

const EXPECTED_STUDENT_FILE_PKS  = counter();

export function make_expected_student_file(
    project_pk: number, pattern: string, args: Partial<ExpectedStudentFile> = {}
): ExpectedStudentFile {
    let defaults = {
        pk: EXPECTED_STUDENT_FILE_PKS.next().value,
        project: project_pk,
        pattern: pattern,
        min_num_matches: 1,
        max_num_matches: 1,
        last_modified: now_str(),
    };
    safe_assign(defaults, args);
    defaults.project = project_pk;
    return new ExpectedStudentFile(defaults);
}

const GROUP_PKS  = counter();

export function make_group(project_pk: number,
                           num_members: number = 1,
                           args: Partial<Group> = {}): Group {
    let defaults = {
        pk: GROUP_PKS.next().value,
        project: project_pk,
        member_names: Array(num_members).fill('').map(() => `user_${random_id()}`),
        extended_due_date: null,
        bonus_submissions_remaining: 0,
        late_days_used: {},
        num_submissions: 0,
        num_submits_towards_limit: 0,
        created_at: now_str(),
        last_modified: now_str(),
    };
    safe_assign(defaults, args);
    defaults.project = project_pk;
    return new Group(defaults);
}


const AG_TEST_SUITE_PKS  = counter();

export function make_ag_test_suite(project_pk: number,
                                   args: Partial<AGTestSuite> = {}): AGTestSuite {
    let defaults = {
        pk: AG_TEST_SUITE_PKS.next().value,
        name: `AG Test Suite ${random_id()}`,
        project: project_pk,
        last_modified: now_str(),
        read_only_instructor_files: true,
        setup_suite_cmd: "",
        setup_suite_cmd_name: "",
        sandbox_docker_image: {
            pk: 1,
            name: "default",
            tag: "default",
            display_name: "Default"
        },
        allow_network_access: false,
        deferred: true,
        normal_fdbk_config: make_ag_test_suite_fdbk_config(),
        past_limit_submission_fdbk_config: make_ag_test_suite_fdbk_config(),
        staff_viewer_fdbk_config: make_ag_test_suite_fdbk_config(),
        ultimate_submission_fdbk_config: make_ag_test_suite_fdbk_config(),
        ag_test_cases: [],
        instructor_files_needed: [],
        student_files_needed: []
    };
    safe_assign(defaults, args);
    defaults.project = project_pk;
    return new AGTestSuite(defaults);
}

export function make_ag_test_suite_fdbk_config(
        args: Partial<AGTestSuiteFeedbackConfig> = {}): AGTestSuiteFeedbackConfig {
    let defaults = {
        show_individual_tests: false,
        show_setup_return_code: false,
        show_setup_stderr: false,
        show_setup_stdout: false,
        show_setup_timed_out: false,
        visible: false
    };
    safe_assign(defaults, args);
    return defaults;
}

const AG_TEST_CASE_PKS = counter();

export function make_ag_test_case(ag_test_suite_pk: number,
                                  args: Partial<AGTestCase> = {}): AGTestCase {
    let defaults = {
        pk: AG_TEST_CASE_PKS.next().value,
        name: `AG Test Case ${random_id()}`,
        ag_test_suite: ag_test_suite_pk,
        normal_fdbk_config: make_ag_test_case_feedback_config(),
        ultimate_submission_fdbk_config: make_ag_test_case_feedback_config(),
        past_limit_submission_fdbk_config: make_ag_test_case_feedback_config(),
        staff_viewer_fdbk_config: make_ag_test_case_feedback_config(),
        last_modified: '',
        ag_test_commands: []
    };
    safe_assign(defaults, args);
    defaults.ag_test_suite = ag_test_suite_pk;
    return new AGTestCase(defaults);
}

export function make_ag_test_case_feedback_config(args: Partial<AGTestCaseFeedbackConfig> = {}) {
    let defaults = {
        visible: false,
        show_individual_commands: false
    };
    safe_assign(defaults, args);
    return defaults;
}

const AG_TEST_COMMAND_PKS = counter();

export function make_ag_test_command(ag_test_case_pk: number,
                                     args: Partial<AGTestCommand> = {}): AGTestCommand {
    let defaults = {
        pk: AG_TEST_COMMAND_PKS.next().value,
        name: `AG Test Command ${random_id()}`,
        ag_test_case: ag_test_case_pk,
        last_modified: now_str(),
        cmd: "true",
        stdin_source: StdinSource.none,
        stdin_text: "",
        stdin_instructor_file: null,
        expected_return_code: ExpectedReturnCode.none,
        expected_stdout_source: ExpectedOutputSource.none,
        expected_stdout_text: "",
        expected_stdout_instructor_file: null,
        expected_stderr_source: ExpectedOutputSource.none,
        expected_stderr_text: "",
        expected_stderr_instructor_file: null,
        ignore_case: false,
        ignore_whitespace: false,
        ignore_whitespace_changes: false,
        ignore_blank_lines: false,
        points_for_correct_return_code: 0,
        points_for_correct_stdout: 0,
        points_for_correct_stderr: 0,
        deduction_for_wrong_return_code: 0,
        deduction_for_wrong_stdout: 0,
        deduction_for_wrong_stderr: 0,
        normal_fdbk_config: make_ag_test_command_fdbk_config(),
        first_failed_test_normal_fdbk_config: null,
        ultimate_submission_fdbk_config: make_ag_test_command_fdbk_config(),
        past_limit_submission_fdbk_config: make_ag_test_command_fdbk_config(),
        staff_viewer_fdbk_config: make_ag_test_command_fdbk_config(),
        time_limit: 10,
        stack_size_limit: 10000000,
        virtual_memory_limit: 500000000,
        process_spawn_limit: 0
    };
    safe_assign(defaults, args);
    defaults.ag_test_case = ag_test_case_pk;
    return new AGTestCommand(defaults);
}

export function make_ag_test_command_fdbk_config(
        args: Partial<AGTestCommandFeedbackConfig> = {}): AGTestCommandFeedbackConfig {
    let defaults = {
        visible: false,
        return_code_fdbk_level: ValueFeedbackLevel.no_feedback,
        stdout_fdbk_level: ValueFeedbackLevel.no_feedback,
        stderr_fdbk_level: ValueFeedbackLevel.no_feedback,
        show_points: false,
        show_actual_return_code: false,
        show_actual_stdout: false,
        show_actual_stderr: false,
        show_whether_timed_out: false
    };
    safe_assign(defaults, args);
    return defaults;
}

export function make_ag_command(args: Partial<AGCommand> = {}): AGCommand {
    let defaults = {
        name: '',
        cmd: 'true',
        time_limit: 10,
        stack_size_limit: 10000000,
        virtual_memory_limit: 500000000,
        process_spawn_limit: 0,
    };
    safe_assign(defaults, args);
    return defaults;
}

const MUTATION_TEST_SUITE_PKS = counter();

export function make_mutation_test_suite(
        project_pk: number,
        args: Partial<MutationTestSuite> = {}): MutationTestSuite {
    let defaults = {
        pk: MUTATION_TEST_SUITE_PKS.next().value,
        name: `Mutation Test Suite ${random_id()}`,
        project: project_pk,
        last_modified: now_str(),
        read_only_instructor_files: true,
        buggy_impl_names: [],
        use_setup_command: false,
        setup_command: make_ag_command(),
        get_student_test_names_command: make_ag_command(),
        max_num_student_tests: 10,
        student_test_validity_check_command: make_ag_command(),
        grade_buggy_impl_command: make_ag_command(),
        points_per_exposed_bug: "0",
        max_points: null,
        deferred: false,
        sandbox_docker_image: {
            pk: 1,
            name: "default",
            tag: "default",
            display_name: "Default"
        },
        allow_network_access: false,
        normal_fdbk_config: make_mutation_test_suite_fdbk_config(),
        ultimate_submission_fdbk_config: make_mutation_test_suite_fdbk_config(),
        past_limit_submission_fdbk_config: make_mutation_test_suite_fdbk_config(),
        staff_viewer_fdbk_config: make_mutation_test_suite_fdbk_config(),
        instructor_files_needed: [],
        student_files_needed: [],
    };
    safe_assign(defaults, args);
    defaults.project = project_pk;
    return new MutationTestSuite(defaults);
}

export function make_mutation_test_suite_fdbk_config(
        args: Partial<MutationTestSuiteFeedbackConfig> = {}): MutationTestSuiteFeedbackConfig {
    let defaults = {
        visible: false,
        show_setup_return_code: false,
        show_setup_stdout: false,
        show_setup_stderr: false,
        show_invalid_test_names: false,
        show_points: false,
        bugs_exposed_fdbk_level: BugsExposedFeedbackLevel.exposed_bug_names,
        show_get_test_names_return_code: false,
        show_get_test_names_stdout: false,
        show_get_test_names_stderr: false,
        show_validity_check_stdout: false,
        show_validity_check_stderr: false,
        show_grade_buggy_impls_stdout: false,
        show_grade_buggy_impls_stderr: false
    };
    safe_assign(defaults, args);
    return defaults;
}

function random_id() {
    let result = '';
    let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 20; ++i) {
        result += chars.charAt(rand_int(chars.length - 1));
    }
    return result;
}

function rand_int(max: number) {
    return Math.floor(Math.random() * max);
}

function now_str() {
    return (new Date()).toISOString();
}
