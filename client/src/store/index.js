import { useArticleStore } from './_stores/_articleStore';
import { useBenefitStore } from './_stores/_benefitStore';
import { useClientStore } from './_stores/_clientStore';
import { useCommentStore } from './_stores/_commentStore';
import { useDepartmentStore } from './_stores/_departmentStore';
import { useDownvoteStore } from './_stores/_downvoteStore';
import { useExpenseStore } from './_stores/_expenseStore';
import { useExpertiseStore } from './_stores/_expertiseStore';
import { useIncomeStore } from './_stores/_incomeStore';
import { useInsuranceStore } from './_stores/_insuranceStore';
import { useInvestmentStore } from './_stores/_investmentStore';
import { useInvoiceStore } from './_stores/_invoiceStore';
import { useLoanStore } from './_stores/_loanStore';
import { usePaymentStore } from './_stores/_paymentStore';
import { usePermissionStore } from './_stores/_permissionStore';
import { usePriorityStore } from './_stores/_priorityStore';
import { useProjectStore } from './_stores/_projectStore';
import { useRevenueStore } from './_stores/_revenueStore';
import { useRoleStore } from './_stores/_roleStore';
import { useSalaryStore } from './_stores/_salaryStore';
import { useSavingStore } from './_stores/_savingStore';
import { useTeamStore } from './_stores/_teamStore';
import { useTestimonialStore } from './_stores/_testimonialStore';
import { useTokenStore } from './_stores/_tokenStore';
import { useUpvoteStore } from './_stores/_upvoteStore';
import { useUserStore } from './_stores/_userStore';
import { useViewStore } from './_stores/_viewStore';

const useStore = () => ({
    article: useArticleStore(),
    benefit: useBenefitStore(),
    client: useClientStore(),
    comment: useCommentStore(),
    department: useDepartmentStore(),
    downvote: useDownvoteStore(),
    expense: useExpenseStore(),
    expertise: useExpertiseStore(),
    income: useIncomeStore(),
    insurance: useInsuranceStore(),
    investment: useInvestmentStore(),
    invoice: useInvoiceStore(),
    loan: useLoanStore(),
    payment: usePaymentStore(),
    permission: usePermissionStore(),
    priority: usePriorityStore(),
    project: useProjectStore(),
    revenue: useRevenueStore(),
    role: useRoleStore(),
    salary: useSalaryStore(),
    saving: useSavingStore(),
    team: useTeamStore(),
    testimonial: useTestimonialStore(),
    token: useTokenStore(),
    upvote: useUpvoteStore(),
    user: useUserStore(),
    view: useViewStore(),
});

export default useStore;